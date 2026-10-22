export type TranscriptTone = 'command' | 'heading' | 'output' | 'warning' | 'success';

export interface TranscriptLine{
    tone: TranscriptTone;
    text: string;
}

export const DEPLOY_TRANSCRIPT: TranscriptLine[] = [
    { tone: 'command', text: 'bash scripts/deploy.sh' },
    { tone: 'heading', text: '==> Checking prerequisites' },
    { tone: 'output', text: '    docker 28.5.1, compose 2.40.0' },
    { tone: 'heading', text: '==> Preparing .env' },
    { tone: 'output', text: '    created .env from .env.example' },
    { tone: 'output', text: '    generated SECRET_KEY' },
    { tone: 'output', text: '    generated ENCRYPTION_KEY' },
    { tone: 'output', text: '    generated POSTGRES_PASSWORD' },
    { tone: 'output', text: '    generated SERVER_IP' },
    { tone: 'output', text: '    generated DOMAIN' },
    { tone: 'output', text: '    generated CLIENT_HOST' },
    { tone: 'output', text: '    generated PUBLIC_HOST' },
    { tone: 'warning', text: '    ! GITHUB_CLIENT_ID/SECRET are empty — repository deploys stay disabled.' },
    { tone: 'warning', text: '    ! Add them to .env later and re-run this script. See the README.' },
    { tone: 'heading', text: '==> Starting the stack' },
    { tone: 'output', text: '[+] Running 5/5' },
    { tone: 'output', text: ' ✔ Network quantum_quantum_network  Created' },
    { tone: 'output', text: ' ✔ Volume "quantum_postgres_data"   Created' },
    { tone: 'output', text: ' ✔ Container quantum-postgres       Healthy' },
    { tone: 'output', text: ' ✔ Container quantum-api            Started' },
    { tone: 'output', text: ' ✔ Container quantum-web            Started' },
    { tone: 'heading', text: '==> Waiting for the server to become healthy' },
    { tone: 'success', text: 'Quantum is up.' },
    { tone: 'output', text: '  Web app   http://localhost:5050' },
    { tone: 'output', text: '  API       http://localhost:7080' }
];

export const LOG_PRELUDE = [
    '> storefront@2.3.0 start',
    '> node server.js',
    '',
    'storefront listening on 0.0.0.0:3000',
    'connected to postgres at 172.30.0.2:5432',
    'connected to redis at 172.30.0.3:6379'
];

export const LOG_REQUESTS = [
    'GET  /',
    'GET  /api/products?page=2',
    'GET  /products/linen-shirt',
    'POST /api/cart',
    'GET  /api/cart',
    'GET  /api/recommendations',
    'POST /api/checkout',
    'GET  /orders/48213'
];

export interface ShellExchange{
    command: string;
    output: string[];
}

export const SHELL_PROMPT = '/app # ';

export const SHELL_SESSION: ShellExchange[] = [
    { command: 'node -v', output: ['v24.11.0'] },
    { command: 'ls', output: ['Dockerfile    node_modules  package.json  public        server.js'] },
    { command: 'echo $DATABASE_URL', output: ['postgresql://qdb_7f3a91c2:•••@172.30.0.2:5432/postgres_9b41d7e0'] },
    { command: 'wget -qO- http://172.30.0.12:8080/health', output: ['{"status":"ok","uptime":86412}'] }
];
