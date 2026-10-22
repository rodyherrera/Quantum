import { entity } from '@/modules/home/utils/demo/entities';
import { TemplateSource } from '@quantum/contracts/modules/template/domain';
import type { Template, TemplateServiceSpec } from '@quantum/contracts/modules/template/domain';

interface CatalogueEntry{
    name: string;
    slug: string;
    description: string;
    website: string | null;
    image: string;
    dependencies?: Record<string, string>;
}

const CATALOGUE: CatalogueEntry[] = [
    { name: 'Directus', slug: 'directus', description: 'Turn your data into a headless CMS, admin panels, or apps. Built for devs, used by everyone.', website: 'https://directus.io/', image: 'directus/directus:11.3.2', dependencies: { redis: 'redis:latest', postgres: 'postgis/postgis:13-master' } },
    { name: 'Uptime Kuma', slug: 'uptime-kuma', description: 'Self-hosted, open-source, fancy uptime monitoring and alerting system.', website: null, image: 'louislam/uptime-kuma:1' },
    { name: 'Appsmith', slug: 'appsmith', description: 'Build better apps, faster, with fewer resources. Leading companies are innovating with Appsmith.', website: null, image: 'index.docker.io/appsmith/appsmith-ee:latest' },
    { name: 'ownCloud', slug: 'owncloud', description: 'An open-source file sync, share and content collaboration software.', website: 'https://owncloud.com/', image: 'owncloud/server:latest' },
    { name: 'ActivePieces', slug: 'activepieces', description: "Automation software that's AI-first, no-code & open-source.", website: 'https://www.activepieces.com/', image: 'activepieces/activepieces:latest' },
    { name: 'n8n', slug: 'n8n', description: 'Secure and AI-native workflow automation tool for technical people. Insert code when you need it.', website: 'https://n8n.io/', image: 'docker.n8n.io/n8nio/n8n:latest', dependencies: { postgres: 'postgres:latest' } },
    { name: 'Tooljet', slug: 'tooljet', description: 'Open-source low-code framework to build and deploy internal tools with minimal engineering effort.', website: 'https://www.tooljet.com/', image: 'tooljet/try:ee-lts-latest' },
    { name: 'Ollama', slug: 'ollama', description: 'The easiest way to get up and running with large language models.', website: 'https://ollama.com/', image: 'ollama/ollama:latest' },
    { name: 'Homarr', slug: 'homarr', description: 'A simple, yet powerful dashboard for your server.', website: 'https://homarr.dev/', image: 'ghcr.io/ajnart/homarr:latest' },
    { name: 'Eclipse Mosquitto', slug: 'eclipse-mosquitto', description: 'An open source message broker which implements MQTT version 5, 3.1.1 and 3.1.', website: 'https://mosquitto.org/', image: 'eclipse-mosquitto:latest' },
    { name: 'phpMyAdmin', slug: 'phpmyadmin', description: 'A free software tool written in PHP, intended to handle the administration of MySQL over the Web.', website: 'https://www.phpmyadmin.net/', image: 'phpmyadmin:latest' },
    { name: 'Mongo', slug: 'mongo', description: 'MongoDB document databases provide high availability and easy scalability.', website: 'https://www.mongodb.com/', image: 'mongo:latest' },
    { name: 'MariaDB', slug: 'mariadb', description: 'One of the most popular open source relational databases.', website: null, image: 'mariadb:latest' },
    { name: 'PostgreSQL', slug: 'postgresql', description: 'The PostgreSQL object-relational database system provides reliability and data integrity.', website: 'https://www.postgresql.org/', image: 'postgres:latest' },
    { name: 'MySQL', slug: 'mysql', description: 'MySQL is a widely used, open-source relational database management system (RDBMS).', website: 'https://mysql.com/', image: 'mysql:latest' },
    { name: 'Kali Linux', slug: 'kali-linux', description: 'Penetration testing and ethical hacking Linux distribution.', website: 'https://www.kali.org/', image: 'kalilinux/kali-rolling:latest' },
    { name: 'Alpine Linux', slug: 'alpine-linux', description: 'A security-oriented, lightweight Linux distribution based on musl libc and busybox.', website: 'https://alpinelinux.org', image: 'alpine:latest' },
    { name: 'Ubuntu', slug: 'ubuntu', description: 'A Debian-based Linux operating system based on free software.', website: 'https://ubuntu.com', image: 'ubuntu:latest' },
    { name: 'Code Server', slug: 'code-server', description: 'Code on any device with a consistent development environment.', website: 'https://hub.docker.com/r/linuxserver/code-server', image: 'codercom/code-server:latest' },
    { name: 'Wordpress', slug: 'wordpress', description: 'Everything you need to build and grow any website — all in one place.', website: 'https://wordpress.com/', image: 'wordpress:latest', dependencies: { mariadb: 'mariadb:latest' } },
    { name: 'NGINX', slug: 'nginx', description: 'An open source reverse proxy server for HTTP, HTTPS, SMTP, POP3, and IMAP protocols.', website: 'https://nginx.org/', image: 'nginx:latest' }
];

const servicesOf = ({ image, dependencies = {} }: CatalogueEntry): Record<string, TemplateServiceSpec> => ({
    app: { image, kind: 'app' },
    ...Object.fromEntries(Object.entries(dependencies).map(([name, dependency]) => [name, { image: dependency, kind: 'database' as const }]))
});

export const DEMO_TEMPLATES: Template[] = CATALOGUE
    .map((entry, index): Template => ({
        ...entity(index + 1, 43_200),
        name: entry.name,
        slug: entry.slug,
        description: entry.description,
        icon: null,
        website: entry.website,
        source: TemplateSource.Builtin,
        organizationId: null,
        spec: { services: servicesOf(entry) },
        inputsSchema: []
    }))
    .sort((left, right) => (left.name < right.name ? -1 : 1));

export const MARQUEE_TEMPLATES = CATALOGUE.map(({ name, image }) => ({ name, image }));
