import { describe, expect, it } from 'vitest';
import { guideFor, targetFor, troublesFor } from '@/modules/home/utils/guide';
import type { GuideBlock, GuideStep, Setup } from '@/modules/home/utils/guide';

const SETUPS: Setup[] = ['ip', 'domain'];

const target = targetFor('203.0.113.24', 'quantum.example.com');

const commandsOf = (steps: GuideStep[]): string[] => steps
    .flatMap((step) => step.blocks)
    .flatMap((block) => (block.kind === 'command' ? [block.code] : []));

const stepOf = (steps: GuideStep[], id: string): GuideStep | undefined => steps.find((step) => step.id === id);

const fieldsOf = (step: GuideStep | undefined): Record<string, string> => Object.fromEntries((step?.blocks ?? [])
    .flatMap((block: GuideBlock) => (block.kind === 'fields' ? block.fields : []))
    .map((field) => [field.label, field.value]));

describe('targetFor', () => {
    it('keeps only the host of whatever was typed', () => {
        expect(targetFor(' 203.0.113.24 ', 'https://Quantum.Example.com:8443/dashboard'))
            .toEqual({ ip: '203.0.113.24', domain: 'quantum.example.com' });
    });

    it('falls back to placeholders that read as something to replace', () => {
        expect(targetFor('', '  ')).toEqual({ ip: 'YOUR_SERVER_IP', domain: 'YOUR_DOMAIN' });
    });
});

describe('guideFor', () => {
    it('connects to the server, publishes its IP and opens both ports', () => {
        const steps = guideFor('ip', target);
        const commands = commandsOf(steps);

        expect(steps.map((step) => step.id)).toEqual([
            'terminal', 'tools', 'download', 'docker', 'start', 'firewall', 'account', 'templates', 'github', 'signups', 'update'
        ]);
        expect(commands).toContain('ssh root@203.0.113.24');
        expect(commands).toContain('bash scripts/deploy.sh --public');
        expect(commands).toContain('sudo ufw allow 5050/tcp && sudo ufw allow 7080/tcp');
    });

    it('points the domain before starting and puts HTTPS in front before the first sign-in', () => {
        const steps = guideFor('domain', target);
        const ids = steps.map((step) => step.id);
        const commands = commandsOf(steps);

        expect(ids.indexOf('dns')).toBeLessThan(ids.indexOf('start'));
        expect(ids.indexOf('https')).toBeLessThan(ids.indexOf('account'));
        expect(commands).toContain('bash scripts/deploy.sh --host quantum.example.com');
        expect(commands).toContain('sudo ufw allow 80/tcp && sudo ufw allow 443/tcp');
        expect(commands).toContain('sudo certbot --nginx -d quantum.example.com');
        expect(commands.find((code) => code.includes('/etc/nginx/sites-available/quantum >'))).toContain('server_name quantum.example.com;');
        expect(commands.find((code) => code.includes('^DOMAIN='))).toContain('DOMAIN=https://quantum.example.com/api');
    });

    it('names the DNS record after the subdomain, or @ for the domain itself', () => {
        expect(fieldsOf(stepOf(guideFor('domain', target), 'dns'))).toEqual({ Type: 'A', Name: 'quantum', Value: '203.0.113.24' });
        expect(fieldsOf(stepOf(guideFor('domain', targetFor('203.0.113.24', 'example.com')), 'dns')).Name).toBe('@');
    });

    it('gives GitHub the callback the API answers on', () => {
        const callback = (setup: Setup) => fieldsOf(stepOf(guideFor(setup, target), 'github'))['Authorization callback URL'];

        expect(callback('ip')).toBe('http://203.0.113.24:7080/github/oauth/callback');
        expect(callback('domain')).toBe('https://quantum.example.com/api/github/oauth/callback');
    });

    it('links the dashboard only once the address is known', () => {
        expect(stepOf(guideFor('ip', target), 'account')?.blocks[0])
            .toEqual({ kind: 'link', label: 'Open your dashboard', href: 'http://203.0.113.24:5050' });
        expect(stepOf(guideFor('ip', targetFor('', '')), 'account')?.blocks[0])
            .toEqual({ kind: 'fields', fields: [{ label: 'Dashboard address', value: 'http://YOUR_SERVER_IP:5050' }] });
    });

    it('updates without flags, so .env keeps every value already set', () => {
        for(const setup of SETUPS){
            expect(commandsOf(guideFor(setup, target))).toContain('git pull && bash scripts/deploy.sh');
        }
    });
});

describe('troublesFor', () => {
    it('offers to pass the IP by hand only where the script looks it up', () => {
        expect(troublesFor('ip', target).find((trouble) => trouble.id === 'public-ip')?.commands)
            .toEqual(['bash scripts/deploy.sh --host 203.0.113.24']);
        expect(troublesFor('domain', target).map((trouble) => trouble.id)).not.toContain('public-ip');
    });
});
