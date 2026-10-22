import { GITHUB_URL } from '@/modules/home/utils/links';

export type Setup = 'ip' | 'domain';

interface GuideField{
    label: string;
    value: string;
}

export type GuideBlock =
    | { kind: 'command'; code: string; label?: string }
    | { kind: 'fields'; fields: GuideField[]; label?: string }
    | { kind: 'expect'; lines: string[] }
    | { kind: 'link'; label: string; href: string }
    | { kind: 'note'; text: string };

export interface GuideStep{
    id: string;
    title: string;
    summary: string;
    isOptional: boolean;
    blocks: GuideBlock[];
}

export interface GuideTarget{
    ip: string;
    domain: string;
}

interface GuideUrls{
    dashboard: string;
    api: string;
    callback: string;
}

export interface Trouble{
    id: string;
    problem: string;
    fix: string;
    commands: string[];
}

const SERVER_IP = 'YOUR_SERVER_IP';

const DOMAIN = 'YOUR_DOMAIN';

const typedOr = (typed: string, fallback: string): string => {
    const host = typed.trim().replace(/^[a-z]+:\/\//i, '').replace(/[/:].*$/, '').toLowerCase();
    return host === '' ? fallback : host;
};

export const targetFor = (ip: string, domain: string): GuideTarget => ({
    ip: typedOr(ip, SERVER_IP),
    domain: typedOr(domain, DOMAIN)
});

const hostFor = (setup: Setup, target: GuideTarget): string => (setup === 'ip' ? target.ip : target.domain);

const urlsFor = (setup: Setup, host: string): GuideUrls => setup === 'domain'
    ? { dashboard: `https://${host}`, api: `https://${host}/api`, callback: `https://${host}/api/github/oauth/callback` }
    : { dashboard: `http://${host}:5050`, api: `http://${host}:7080`, callback: `http://${host}:7080/github/oauth/callback` };

const deployCommand = (setup: Setup, host: string): string => (setup === 'ip' ? 'bash scripts/deploy.sh --public' : `bash scripts/deploy.sh --host ${host}`);

const isPlaceholder = (host: string): boolean => host === SERVER_IP || host === DOMAIN;

const recordName = (host: string): string => {
    const labels = host.split('.');
    return labels.length > 2 ? labels.slice(0, -2).join('.') : '@';
};

const nginxSite = (host: string): string => `sudo tee /etc/nginx/sites-available/quantum > /dev/null <<'EOF'
server {
    listen 80;
    server_name ${host};
    location / { proxy_pass http://127.0.0.1:5050; }
    location /api/ {
        proxy_pass http://127.0.0.1:7080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF`;

const terminal = (ip: string): GuideStep => ({
    id: 'terminal',
    title: 'Connect to the server',
    summary: 'From your own computer, open a terminal and connect with SSH. The first time it asks whether to trust the server: type yes.',
    isOptional: false,
    blocks: [
        { kind: 'command', code: `ssh root@${ip}` },
        { kind: 'note', text: 'Your provider may have given you a user other than root, such as `ubuntu`. Use that one instead. Every command from here on runs on the server.' }
    ]
});

const dns = ({ ip, domain }: GuideTarget): GuideStep => ({
    id: 'dns',
    title: 'Point your domain at the server',
    summary: "Where you manage your domain, add an A record that sends it to your server's IP. It can take a few minutes to start working.",
    isOptional: false,
    blocks: [
        { kind: 'fields', label: 'New DNS record', fields: [{ label: 'Type', value: 'A' }, { label: 'Name', value: recordName(domain) }, { label: 'Value', value: ip }] },
        { kind: 'command', label: 'Check it from the server', code: `getent hosts ${domain}` },
        { kind: 'expect', lines: [`${ip}    ${domain}`] },
        { kind: 'note', text: 'Name is `@` for the domain itself, or the part before it for a subdomain: `quantum` for quantum.example.com.' }
    ]
});

const tools: GuideStep = {
    id: 'tools',
    title: 'Install Git and curl',
    summary: 'Quantum is downloaded with Git and its scripts use curl. Most machines already have both; this makes sure.',
    isOptional: false,
    blocks: [
        { kind: 'command', code: 'sudo apt update && sudo apt install -y git curl' },
        { kind: 'note', text: 'Not on Ubuntu or Debian? Install `git` and `curl` with your system\'s package manager. Logged in as root? You can leave out every `sudo`.' }
    ]
};

const download: GuideStep = {
    id: 'download',
    title: 'Download Quantum',
    summary: 'This creates a folder called Quantum and moves you into it. Every command from here on runs inside that folder.',
    isOptional: false,
    blocks: [
        { kind: 'command', code: `git clone ${GITHUB_URL} && cd Quantum` },
        { kind: 'note', text: 'Coming back later in a new terminal? Run `cd Quantum` first.' }
    ]
};

const docker: GuideStep = {
    id: 'docker',
    title: 'Install Docker',
    summary: "Quantum runs everything in Docker containers. This script uses Docker's official installer, and does nothing if Docker is already there.",
    isOptional: false,
    blocks: [
        { kind: 'command', code: 'bash scripts/install_docker.sh' },
        { kind: 'command', label: 'Let your user run Docker (skip this as root)', code: 'sudo usermod -aG docker $USER && newgrp docker' },
        { kind: 'command', label: 'Check it', code: 'docker compose version' },
        { kind: 'expect', lines: ['Docker Compose version v2.40.0'] }
    ]
};

const START_SUMMARY: Record<Setup, string> = {
    ip: 'The --public flag makes Quantum use this server\'s public IP in its addresses. The first run builds everything and takes a few minutes.',
    domain: 'The --host flag puts your domain in Quantum\'s addresses. The first run builds everything and takes a few minutes.'
};

const start = (setup: Setup, host: string): GuideStep => ({
    id: 'start',
    title: 'Start Quantum',
    summary: START_SUMMARY[setup],
    isOptional: false,
    blocks: [
        { kind: 'command', code: deployCommand(setup, host) },
        { kind: 'expect', lines: ['Quantum is up.', '', `  Web app   http://${host}:5050`, `  API       http://${host}:7080`] },
        { kind: 'note', text: 'It never overwrites a value already in `.env`, so running it again is always safe.' }
    ]
});

const firewall = (setup: Setup): GuideStep => {
    const ports = setup === 'domain' ? ['80', '443'] : ['5050', '7080'];

    return {
        id: 'firewall',
        title: setup === 'domain' ? 'Open the web ports' : 'Open the two ports',
        summary: setup === 'domain'
            ? 'Visitors will reach Quantum through NGINX on the standard web ports, 80 and 443.'
            : 'The dashboard listens on port 5050 and the API on 7080. Let both through the firewall.',
        isOptional: false,
        blocks: [
            { kind: 'command', code: ports.map((port) => `sudo ufw allow ${port}/tcp`).join(' && ') },
            { kind: 'note', text: `\`ufw: command not found\` means there is no firewall on the server to open. If your provider has its own, often called a security group, open ${ports.join(' and ')} there too.` }
        ]
    };
};

const https = (host: string): GuideStep => ({
    id: 'https',
    title: 'Put HTTPS in front',
    summary: 'NGINX receives the visits to your domain and hands them to Quantum, and Certbot gets it a free certificate.',
    isOptional: false,
    blocks: [
        { kind: 'command', label: 'Install NGINX and Certbot', code: 'sudo apt install -y nginx certbot python3-certbot-nginx' },
        { kind: 'command', label: 'Tell NGINX about Quantum', code: nginxSite(host) },
        { kind: 'command', label: 'Turn it on', code: 'sudo ln -s /etc/nginx/sites-available/quantum /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx' },
        { kind: 'command', label: 'Get the certificate', code: `sudo certbot --nginx -d ${host}` },
        { kind: 'command', label: 'Move Quantum behind NGINX', code: `sed -i 's|^SERVER_IP=.*|SERVER_IP=127.0.0.1|; s|^DOMAIN=.*|DOMAIN=https://${host}/api|; s|^CLIENT_HOST=.*|CLIENT_HOST=https://${host}|' .env && docker compose up -d --build` },
        { kind: 'note', text: 'Certbot asks for an email and to accept its terms the first time. The last command rebuilds the dashboard, because its address is built into it.' }
    ]
});

const account = (urls: GuideUrls, host: string): GuideStep => ({
    id: 'account',
    title: 'Create your account',
    summary: 'Open the dashboard, click Sign in and type your email. Since it is new, Quantum asks for your name, a username and a password, and you are in.',
    isOptional: false,
    blocks: [
        isPlaceholder(host)
            ? { kind: 'fields', fields: [{ label: 'Dashboard address', value: urls.dashboard }] }
            : { kind: 'link', label: 'Open your dashboard', href: urls.dashboard },
        { kind: 'note', text: 'Until you close sign-ups, anyone who can open this page can create an account.' }
    ]
});

const templates: GuideStep = {
    id: 'templates',
    title: 'Load the template catalogue',
    summary: 'Adds the one-click templates: n8n, WordPress, Directus, Uptime Kuma, Ollama and the rest.',
    isOptional: false,
    blocks: [
        { kind: 'command', code: 'docker compose exec api pnpm seed:templates' },
        { kind: 'expect', lines: ['template catalog seeded: 21 created, 0 already present'] },
        { kind: 'note', text: 'Safe to run again: it only adds the templates that are missing.' }
    ]
};

const github = (urls: GuideUrls): GuideStep => ({
    id: 'github',
    title: 'Connect GitHub',
    summary: 'Needed only to deploy your own repositories. You register a small OAuth app on GitHub and give Quantum its two keys.',
    isOptional: true,
    blocks: [
        { kind: 'link', label: 'Create an OAuth app on GitHub', href: 'https://github.com/settings/applications/new' },
        {
            kind: 'fields',
            label: 'Fill in the form with',
            fields: [
                { label: 'Application name', value: 'Quantum' },
                { label: 'Homepage URL', value: urls.dashboard },
                { label: 'Authorization callback URL', value: urls.callback }
            ]
        },
        { kind: 'note', text: 'Click Register application, then Generate a new client secret. Keep the page open: you need the Client ID and the secret.' },
        { kind: 'command', label: 'Open the settings file', code: 'nano .env' },
        { kind: 'note', text: 'Find the lines `GITHUB_CLIENT_ID=` and `GITHUB_CLIENT_SECRET=` and paste each value right after its equals sign. Save with Ctrl+O and Enter, close with Ctrl+X.' },
        { kind: 'command', label: 'Apply it', code: 'docker compose up -d --build api' }
    ]
});

const signups: GuideStep = {
    id: 'signups',
    title: 'Close sign-ups',
    summary: 'Once your account exists, stop anyone else from creating one.',
    isOptional: false,
    blocks: [
        { kind: 'command', code: "sed -i 's|^REGISTRATION_DISABLED=.*|REGISTRATION_DISABLED=true|' .env && docker compose up -d --build api" },
        { kind: 'note', text: 'Want to let someone sign up later? Run it again with `false` instead of `true`.' }
    ]
};

const update: GuideStep = {
    id: 'update',
    title: 'Keep it up to date',
    summary: 'Get the latest version and run the script again. No flags this time: your .env keeps every value you set.',
    isOptional: false,
    blocks: [
        { kind: 'command', code: 'git pull && bash scripts/deploy.sh' },
        { kind: 'note', text: 'Its summary may print localhost addresses. That is only the message: your addresses do not change.' }
    ]
};

export const guideFor = (setup: Setup, target: GuideTarget): GuideStep[] => {
    const host = hostFor(setup, target);
    const urls = urlsFor(setup, host);

    if(setup === 'ip'){
        return [terminal(target.ip), tools, download, docker, start(setup, host), firewall(setup), account(urls, host), templates, github(urls), signups, update];
    }

    return [terminal(target.ip), dns(target), tools, download, docker, start(setup, host), firewall(setup), https(host), account(urls, host), templates, github(urls), signups, update];
};

export const troublesFor = (setup: Setup, target: GuideTarget): Trouble[] => {
    const host = hostFor(setup, target);

    return [
        {
            id: 'no-docker',
            problem: 'Docker is not installed, or the Docker Compose plugin is missing.',
            fix: 'Install both with the script that comes with Quantum, then run the deploy command again.',
            commands: ['bash scripts/install_docker.sh']
        },
        {
            id: 'daemon',
            problem: 'Cannot talk to the Docker daemon.',
            fix: 'Docker is stopped, or your user cannot use it yet. Start it, let your user run it, and run the deploy command again. Avoid running the script with sudo: your settings file would then belong to root.',
            commands: ['sudo systemctl start docker', 'sudo usermod -aG docker $USER && newgrp docker', deployCommand(setup, host)]
        },
        ...(setup === 'ip' ? [{
            id: 'public-ip',
            problem: 'Could not detect the public IP.',
            fix: 'Give the IP yourself instead of letting the script look it up.',
            commands: [`bash scripts/deploy.sh --host ${target.ip}`]
        }] : []),
        {
            id: 'health',
            problem: 'The server did not answer on http://127.0.0.1:7080/server/health within ~3 minutes.',
            fix: 'The API container is not starting. Its logs say why; a port that is already taken is the usual reason.',
            commands: ['docker compose logs -f api']
        },
        {
            id: 'port',
            problem: 'Docker says a port is already allocated.',
            fix: 'Another program uses 5050 or 7080. In .env, change CLIENT_WEB_APP_PORT or SERVER_PORT, update the port inside DOMAIN and CLIENT_HOST to match, and run the deploy command again.',
            commands: ['nano .env', deployCommand(setup, host)]
        },
        {
            id: 'unreachable',
            problem: 'The dashboard does not open in the browser.',
            fix: 'Check that the ports are open in the server firewall and in your provider\'s firewall, and that you typed http, not https, unless you set up HTTPS.',
            commands: ['docker compose ps']
        },
        {
            id: 'redirect',
            problem: 'GitHub says the redirect_uri is not associated with this application.',
            fix: `The Authorization callback URL on GitHub must be exactly ${urlsFor(setup, host).callback}`,
            commands: []
        }
    ];
};

export const USEFUL_COMMANDS = [
    { label: 'Follow the API logs', code: 'docker compose logs -f api' },
    { label: 'See what is running', code: 'docker compose ps' },
    { label: 'Stop Quantum, keeping your data', code: 'docker compose down' },
    { label: 'Start it again or apply an update', code: 'bash scripts/deploy.sh' }
];
