# Quantum

![Quantum: deploy repositories, databases and compose stacks on your own server](/screenshots/cover.png)

Quantum is a self-hosted PaaS. From one dashboard you deploy GitHub repositories, databases,
one-click templates and Docker Compose stacks on your own server, with logs, a shell, environment
variables, persistent volumes, metrics and VS Code in the browser for every one of them.

- [Deploy Quantum](#deploy-quantum)
- [Using Quantum](#using-quantum)
- [Configuration](#configuration)
- [Where the data lives](#where-the-data-lives)

## Deploy Quantum

You need a Linux host with Docker and the Compose plugin. `bash scripts/install_docker.sh` installs both.

```bash
git clone https://github.com/rodyherrera/Quantum
cd Quantum
bash scripts/deploy.sh
```

The script writes `.env` from `.env.example`, generates the secrets, builds the images and starts
three containers: `quantum-api`, `quantum-web` and `quantum-postgres`. The dashboard is at
`http://localhost:5050` and the API at `http://localhost:7080`.

Then:

1. Sign up through the dashboard. Self-signup is open until you set `REGISTRATION_DISABLED=true`
   in `.env` and run `docker compose up -d --build api`.
2. Load the template catalogue: `docker compose exec api pnpm seed:templates`. Re-running it only
   adds templates that are missing.
3. Create a GitHub OAuth app if you want to deploy repositories (below).

`scripts/deploy.sh` never overwrites a value already set in `.env`, so updating is:

```bash
git pull && bash scripts/deploy.sh
```

### On a public server

```bash
bash scripts/deploy.sh --public                      # URLs on the machine's public IP
bash scripts/deploy.sh --host quantum.example.com    # or on a domain that points at it
```

Open ports **5050** and **7080** in the firewall. For HTTPS, put the reverse proxy you already
run in front of them. With NGINX:

```nginx
server {
    listen 80;
    server_name quantum.example.com;
    location / { proxy_pass http://127.0.0.1:5050; }
    location /api/ {
        proxy_pass http://127.0.0.1:7080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

`certbot --nginx -d quantum.example.com` adds the certificate. Then in `.env`:

```bash
SERVER_IP=127.0.0.1
DOMAIN=https://quantum.example.com/api
CLIENT_HOST=https://quantum.example.com
```

and `docker compose up -d --build`: the ports are now reachable only by the proxy, and `DOMAIN`
is compiled into the web bundle, so the web image needs the rebuild.

## Using Quantum

Everything belongs to an organization; members are owners, admins, members or viewers. Inside
an organization, projects group applications, and every application lives in a project.

![Settings: account, password, organization and team](/screenshots/account.png)

### Applications

![Applications: repositories, databases, templates and compose stacks in one table](/screenshots/applications.png)

An application is one of:

- **A GitHub repository.** Pick it from the connected account, choose a branch, and Quantum
  builds and runs it: a Dockerfile in the repo, a prebuilt image, or your own install, build and
  start commands. Every push to the branch redeploys.
- **A database.** Postgres, MySQL, MariaDB, MongoDB or Redis, with backups and restore from the
  dashboard.
- **A template.** One click on anything in the catalogue: n8n, Directus, WordPress, Uptime Kuma, Ollama and the
  rest.
- **A stack.** **Applications → Deploy stack** takes a compose file, either from one of your
  GitHub repositories or pasted in. Each service becomes a container on the stack's own network, so
  services reach each other by name exactly as with `docker compose up`.

![Template catalogue](/screenshots/templates.png)

Every application has **Logs**, a **Shell** into the container and **Environment** variables,
with **Start**, **Stop**, **Restart** and **Redeploy** at the top of its page. The table shows each
one's internal **Address**; the published ports are on the application itself. Variables save
automatically and apply on **Redeploy**.

![A stack's page: every service with its image, internal address and published ports](/screenshots/services.png)
![Logs, one service at a time](/screenshots/logs.png)

### Compose stacks

![Deploy a stack from one of your repositories or from a pasted compose file](/screenshots/deploy-stack.png)

**From a repository** is the way that runs itself. Pick the repository and branch, Quantum finds the
compose files at its root (`compose.dokploy.yml` and friends count), shows the `${VAR}` placeholders
the file uses so you can fill them, and registers the webhook on GitHub for you. From then on every
push to that branch, or every published release if you prefer, clones the branch, builds the
services that have `build:` on the server, pulls the rest and redeploys. The compose file is read
from the repository on each deploy; edit it there. Branch, file and trigger live in the stack's
**Settings** tab, next to its variables.

![Compose file of a repository stack, read from the repository at every deploy](/screenshots/compose.png)

**Pasted** compose files work too, without `build:` and without a trigger other than the Redeploy
button. Supported per service either way: `image`, `command`, `environment`, `ports`, `volumes`
(named volumes) and `depends_on`, plus `build:` for repository stacks. Host bind mounts are
rejected with a message naming the service. Host ports are assigned by Quantum, as for every other
application. Removing a service from the file and redeploying removes its container.

### Environment variables

![Environment variables per service](/screenshots/environment.png)

Repositories, template installs and compose services each have their own variables. When a
repository is cloned, a `.env` at its root is imported once, so a project that already runs
locally starts with the same configuration.

### Internal addresses

Every container Quantum runs also joins a network shared by the organization. The **Address**
column shows its IP there, so an app deployed from GitHub reaches a compose service or a managed
database at `http://<ip>:<port>` without publishing anything to the host. Services of one stack
reach each other by service name as well. The IP is refreshed when a container is recreated, so
copy it again after a redeploy.

### Metrics, usage and events

![Metrics of one container: CPU, memory, network and processes](/screenshots/metrics.png)

**Metrics** shows one container at a time, whether a repository, a database or a single service of
a stack: CPU, memory, network since start and the processes running inside, with the recent samples
charted.

![Usage: network and CPU per project over a time window](/screenshots/usage.png)

**Usage** adds up transfer, CPU and peak memory per project over the last 15 minutes, hour, 6 hours
or 24 hours.

![Events: every step Quantum took, with its source and time](/screenshots/events.png)

**Events** is the record of what Quantum did: every deployment step, start and stop, with its
source and time. A stack that is still installing shows the same steps on its own page as they
happen.

### Persistent volumes

A repository keeps its checkout across deploys. Anything it writes elsewhere is lost when the
container is recreated, unless the path is listed under **Persistent volumes** in the repository
settings. Databases and templates persist on volumes by default. Volumes go away with the
application.

### Private registries

![Organization settings with container registries](/screenshots/organization.png)

**Settings → Organization → Container registries** takes a registry host, a username and a
token, and every pull from that host uses them. For GitHub Container Registry use a classic
personal access token with `read:packages`; without an entry for `ghcr.io`, Quantum falls back
to the connected GitHub account of the application's owner.

### VS Code in the browser

**Open in VS Code** on any application starts a [code-server](https://github.com/coder/code-server)
container that mounts the same files the application sees, joins its network and hands you a
URL and a password. Edits to a repository land in `/app` at once; exec apps pick them up on
**Restart**, Dockerfile and image apps on the next deploy, and the next push from GitHub replaces
tracked files, so commit what you want to keep. **Stop** frees the workspace.

### Custom domains for deployments

Deployments are reachable through their published ports. To put a hostname in front of one, add
an A record for the server and point a reverse proxy at the port, or at the container's internal
address if the proxy runs on the same host.

### GitHub OAuth

Deploying a repository needs a GitHub OAuth app: **Settings → Developer settings → OAuth Apps →
New OAuth App**. Homepage URL is your `CLIENT_HOST`, callback URL is
`<DOMAIN>/github/oauth/callback`. Copy the client id and secret into `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET` and run `docker compose up -d --build api`. Quantum asks for the `user`,
`repo` and `read:packages` scopes.

![GitHub OAuth Apps](/screenshots/Github-OAuth-Apps.png)
![GitHub OAuth App configuration](/screenshots/Github-OAuth-App-Config.png)

### Plain Compose

The script is a convenience. `cp .env.example .env`, fill `SECRET_KEY`, `ENCRYPTION_KEY` and
`POSTGRES_PASSWORD`, and `docker compose up -d --build` does the same. Compose fails naming the
variable if a required secret is missing.

## Configuration

Everything is in `.env` at the repository root. `deploy.sh` fills the required values; the rest
have working defaults.

| Variable | Notes |
|---|---|
| `SECRET_KEY` | Signs sessions. Any long random string. |
| `ENCRYPTION_KEY` | 64 hex chars, or base64 of exactly 32 bytes. Encrypts stored GitHub and registry tokens. |
| `POSTGRES_PASSWORD` | Generated for you. |
| `SERVER_PORT`, `CLIENT_WEB_APP_PORT`, `POSTGRES_PORT` | Host ports of the API (7080), the web app (5050) and Postgres (5432). Change one when it is already taken. |
| `DOMAIN`, `CLIENT_HOST` | API and web URLs as the browser sees them, with scheme and port. CORS allows exactly `CLIENT_HOST`. |
| `SERVER_IP` | Interface the API and web ports bind to. `0.0.0.0` by default, `127.0.0.1` behind your own proxy. |
| `PUBLIC_HOST` | Public IP or domain the published ports of your applications are linked on. `deploy.sh` fills it; set it by hand when the api resolves DNS differently from your users. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | The OAuth app above. |
| `SMTP_*`, `WEBMASTER_MAIL` | Password resets and alert emails. |
| `REGISTRATION_DISABLED` | `true` closes self-signup. |


## Where the data lives

- **Postgres**: the `postgres_data` volume.
- **Repositories and their logs**: `/var/lib/quantum/<NODE_ENV>/containers/<user id>/`, mounted
  into the API container.
- **Databases, templates, compose volumes and persistent volumes**: Docker named volumes.

On boot, and every five minutes after, the API reconciles what is running against what should be:
containers that should be up are started, addresses are refreshed. A host reboot brings
everything back without any action.

## Support

Issues and pull requests are welcome. If Quantum is useful to you, you can
[buy me a coffee](https://ko-fi.com/codewithrodi).
