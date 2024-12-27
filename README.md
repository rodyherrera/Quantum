# The Open-Source and Self-Hosted Alternative to Heroku, Netlify, and Vercel 🚀
![Quantum Home Page](/screenshots/Quantum-Cloud-Platform.png)
<div>
<a href="https://ko-fi.com/codewithrodi"> <img align="left" src="https://cdn.ko-fi.com/cdn/kofi3.png?v=3" height="50"   width="180" alt="Support Quantum!" /></a>
</div>
<br /> <br />

## Table of Contents
- [Cloning Repository](#cloning-repository)
- [Deploying with Quantum Setup Utility (Recommended)](#deploying-with-quantum-setup-utility-recommended)
- [Deploying with Docker Compose](#deploying-with-docker-compose)
- [Quantum CLI via Docker](#quantum-cli-via-docker)
- [In Case You Don’t Deploy in Docker](#in-case-you-dont-deploy-in-docker)
- [Features](#features)
- [Obtaining GitHub Client Secret and Client ID](#obtaining-github-client-secret-and-client-id)
- [Using NGINX as a Reverse Proxy](#using-nginx-as-a-reverse-proxy)
- [The Quantum CLI](#the-quantum-cli)
- [How Does This Work?](#how-does-this-work)
- [Where Are Repositories and Logs Stored?](#where-are-repositories-and-logs-stored)
- [What Happens When the Server Is Closed?](#what-happens-when-the-server-is-closed)
- [Custom Domains for Your Deployments](#custom-domains-for-your-deployments)
- [How Can I Migrate to New Versions?](#how-can-i-migrate-to-new-versions)
- [We'd Love Your Feedback and Support!](#wed-love-your-feedback-and-support)

Quantum allows you to effortlessly deploy your GitHub repositories, integrating real-time continuous deployment seamlessly. Additionally, you can easily deploy and manage Docker containers. With "One Click Services," you have access to over 20 applications that you can deploy to your Quantum account with just a single click. Among these applications are Uptime Kuma, Code Server, Ollama, various Databases, and many more.

With Quantum, you have full access to the file systems of all your Docker containers and your deployed GitHub repositories. This enables you to make adjustments directly without the need to perform an immediate commit. You can configure environment variables, access the terminal, restart or shut down containers, and utilize many other functionalities.

To deploy the application, you can use the [Quantum Setup Utility](#deploying-with-quantum-setup-utility-recommended), which simplifies the installation process on your VPS quickly and easily. Alternatively, you also have the option to use [Docker Compose](#deploying-with-docker-compose).

![Quantum Cloud Dashboard](/screenshots/Dashboard.png)
![Quantum Cloud Console](/screenshots/Cloud-Console.png)
![Repository CLI](/screenshots/RepositoryCLI.png)
![Repository File Explorer](/screenshots/File-Explorer.png)

While Quantum offers a panel for configuring commands such as installing dependencies (e.g., "npm install"), building source code (e.g., "npm run build"), or starting your software (e.g., "npm run start"), it also provides a separate panel specifically for managing environment variables. It's worth noting that this isn't a manual process where you input variables and their values one by one. When the repository is cloned, Quantum automatically maps the environment variables, allowing you to assign their respective values later on. You have the flexibility to create, delete, and modify environment variables associated with the deployment of your repository as needed.

![Repository Environment Variables](/screenshots/RepositoryEnvironVariables.png)
![User Profile](/screenshots/User-Profile.png)
I've successfully **migrated all my frontend applications from Vercel and my various VPS services to Quantum**. The platform's ease of use and efficiency are evident in the 15 repositories I currently have deployed – a testament to my confidence in Quantum.

## Cloning Repository
```bash
git clone https://github.com/rodyherrera/Quantum
```
This command clones the Quantum repository from GitHub to your local machine.

You can deploy using **Quantum Setup Utility (Recommended)**, **Docker Compose** or from **source**.

## Deploying with Quantum Setup Utility (Recommended)
The easiest way to deploy is with Docker. You can configure environment variables through the **.env** file located at the root of the repository. And then just type **docker compose up -d --build**. But also, you can use the **Quantum deployment tool**.

In the **root of the repository** write the following command:

```bash
bash scripts/deploy-setup-utility.sh
```

Once executed, the deployment of the tool should begin, **environment variables will be adjusted automatically and this is the reason why we recommend using this method.**

![Setup Utility Script](/screenshots/Setup-Utility-Script.png)
![Setup Utility Script Deployed Services](/screenshots/Setup-Utility-Script-Deployed-Services.png)
![Setup Utility Script Home Page](/screenshots/Setup-Utility-Home.png)
![Setup Utility Script Home Page](/screenshots/Setup-Utility-Quantum-Deployment.png)

**NOTE**: If you want to use a domain, you can use NGINX to reverse proxy or use the NGINX Reverse Proxy application (Recommended).

## Deploying with Docker Compose
Deploying through Docker is relatively simple. Within the root of the directory there is a **.env** file. **You must fill in ALL the variables that are NOT commented.** Those environment variables that are mentioned are optional.

![Docker Compose Environ Variables](/screenshots/Docker-Compose-Environ-Variables.png)

Then, run the following command in the root of the directory.

```bash
docker-compose up -d --build 
```
When deploying to Docker, you will have three new containers:
 1. The Quantum server (back-end)
 2. The web application (front-end)
 3. The MongoDB instance (database)

By default, the back-end server will be deployed on port **7080**. The front-end server on port **5050**.

**NOTE**: If you want to use a domain, you can use NGINX to reverse proxy or use the NGINX Reverse Proxy application (Recommended).

## Quantum CLI via Docker
This is useful, as it will help you create `your administrator user`. 
If you have already deployed to Docker, you can access the CLI via the following command:
```bash
docker exec -it quantum-server-1 npm run cli
```
After running it, if your container is active, you will be able to correctly access the available options.
[You can learn more about the Quantum CLI here.](#the-quantum-cli)

## In case you don't deploy in Docker

Thought about Docker and deployment setup for 5 seconds
Here’s a unified text that summarizes everything clearly:

When deploying with Docker, you only need to edit a single `.env` file located at the root of the repository (as mentioned in the corresponding section). Most environment variables are already set, so you typically only have to adjust the secret keys.

If you choose not to use Docker, you must still configure the environment variables, but this time they won’t be centralized in a single file. Instead, you’ll need to modify variables in both the `client/` and `server/` directories, and you’ll also have to update additional variables—such as the MongoDB URI.

For the client application, go to the `client/` directory, run `npm install`, then `npm run build`. After building, you can serve the `dist` folder on a specific port with a tool like `serve` by running `npx serve -s dist`. In that same folder, rename `client/.env.example` to `client/.env`. There are only two variables you need to change:

```bash
# VITE_SERVER: Address where the 
# Quantum backend is deployed.
VITE_SERVER = http://0.0.0.0:8000

# VITE_API_SUFFIX: Suffix to make API 
# calls, you should not change /api/v1.
VITE_API_SUFFIX = /api/v1
```

For the server application, navigate to the `server/` directory, run `npm install`, and then launch the server with `npm run start`.

Once you’ve configured and built both the client and server applications (and updated all necessary environment variables), you’ll have everything you need to proceed with the deployment.

## Obtaining GitHub Client Secret and Client ID
To integrate your application with GitHub's API, you'll need to obtain a Client Secret and Client ID. Follow these detailed steps to acquire them:

1. **Sign in to your GitHub account:** Go to [GitHub](https://github.com/) and sign in with your user credentials.
2. **Access your account settings:** Click on your profile avatar in the top right corner and select "Settings" from the dropdown menu.
3. **Navigate to the "Developer settings" section:** In the left sidebar, click on "Developer settings."
4. **Create a new OAuth application:** Select "OAuth Apps" and click on the "New OAuth App" button.
5. **Provide application information:** Please enter your app name, your home page URL, and return authorization URL. Please note that the "Home Page URL" must be the address where the server is hosted and cannot be local, that is, it must be accessible to third parties, for example: "http://82.208.22.71:5001 " or "quantum-server.mydomain.com". Likewise, the "Return Authorization URL" must contain the address where the server is hosted followed by the path of the API responsible for returning authorization from Github, for example: "http://82.208.22.71:5002/api/v1/github/callback/" or "https://quantum-server.mydomain.com/api/v1/github/callback/".
6. **Register the application:** Click on the "Register application" button.
7. **Copy the application credentials:** Once registered, GitHub will generate a Client ID and Client Secret. Copy these values and securely store them.
8. **Utilize the credentials in your application:** Use the Client ID and Client Secret in your application's configuration to authenticate requests to GitHub's API.

It is important that you do this step, otherwise NO ONE will simply be able to use your application, including you.

![Github OAuth Apps](/screenshots/Github-OAuth-Apps.png)
![Github OAuth App Config](/screenshots/Github-OAuth-App-Config.png)

## Using NGINX as a reverse proxy
If you want to assign a custom domain (or multiple domains) to your Quantum deployment, using NGINX as a reverse proxy is the recommended approach. Below is a general outline of how to set this up.

Personally, I recommend you use [NGINX Proxy Manager](https://nginxproxymanager.com/).
![NGINX Proxy Manager](/screenshots/NGINX-Proxy-Manager.png)

Otherwise, follow these instructions. (as you would with any other app):

### 1. Create Your DNS Records
First, you need to create A records in your DNS provider (e.g., Namecheap, GoDaddy, Cloudflare) that point your chosen domain (e.g., `quantum.yourdomain.com`) to the public IP address of the server hosting Quantum.

For example, in Namecheap, you’d add an A record like:
```vbnet
Host:    @
Value:   123.456.78.90  (Your server’s public IP)
TTL:     Automatic
```
*(You can also create subdomain records like `app.yourdomain.com` if preferred.)*

### 2. Install and Configure NGINX
On the server hosting Quantum, install NGINX (if you haven’t already). For most Linux distributions, the command is typically:

```bash
sudo apt-get update
sudo apt-get install nginx
```
Once installed, you can modify the default NGINX configuration or create a new one specific to your domain. For instance, in `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80;
    server_name quantum.yourdomain.com;

    location / {
        # Option 1: If you want to point directly to the Quantum server’s public IP and port
        # proxy_pass http://123.456.78.90:7080/;

        # Option 2: If you're hosting the Quantum back-end in Docker on the same machine,
        # you can use the Docker container’s internal IP (e.g., 172.17.0.2)
        # or `localhost` along with the mapped port.
        proxy_pass http://localhost:7080/;

        # Pass additional headers if necessary
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```
Replace `quantum.yourdomain.com` with your actual domain or subdomain, and adjust the IP/port according to your Quantum server configuration.

### 3. Enable the New Configuration
Next, test your NGINX configuration and reload if there are no errors:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. (Optional) Add HTTPS/SSL
To secure your domain with HTTPS, you can use Certbot or another SSL certificate provider:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d quantum.yourdomain.com
```
Follow the prompts to complete the SSL setup.

### 5. Verify Your Setup
In a browser, navigate to `http://quantum.yourdomain.com` (or `https://...` if using SSL).
You should see your Quantum application served via NGINX at your custom domain.

**That’s it!** You have successfully set up NGINX as a reverse proxy for your Quantum deployment. From now on, you can access your Quantum server (and any associated front-end or back-end services) via the domain name(s) you configured, without needing to remember the internal ports or IP addresses.

## The Quantum CLI 
Through the CLI, you can create a user account as an administrator, reestablish the database among other options provided by the platform for management purposes.

In order to access the CLI, you must go to the "server" directory, and there execute the "npm run cli" command, followed by this, the program will start and you must choose the option you want to use in the administrator.

```bash
# Entering the "server" directory.
cd server/
# Initializing the CLI
npm run cli
```

When deploying Quantum, you must use this CLI, since user registration for security reasons is disabled, therefore both through the API and through the web-UI you will not be able to create a new account, therefore you must After creating the account through the CLI, just run it.

![Quantum CLI](/screenshots/QuantumCLI.png)

## How does this work?

When you create an account on Quantum, a Docker instance is spawned within the host server, using the 'alpine:linux' image. Each user is allocated a dedicated Docker instance where their logs and repositories are stored and executed. This setup ensures isolation between users, enabling precise control over their deployments and management.

When a user initiates the creation of a repository or deployment, they select it from the list of public or private repositories associated with their account. The chosen repository is then cloned into their Docker instance. Subsequently, in the web UI, they are directed to the "Build & Dev Settings" page. Here, they configure essential commands for deploying the repository, such as installation, build, and start commands.

Additionally, users have the option to modify the "rootDirectory" parameter, specifying the directory within their repository where these commands should be executed. This is particularly useful if their application is not located in the root directory ("/") of their repository.

Once these parameters are configured, the deployment is created in Quantum and registered in their GitHub repository. A webhook is automatically generated in their repository to listen for commits. Consequently, whenever a commit is made, the repository is redeployed automatically, ensuring seamless updates.

Upon cloning the repository, Quantum initiates a mapping process for environment files. Any environment files detected are then loaded into the database. This preemptive action ensures that project variables are readily available, eliminating the need for manual creation. Users retain the flexibility to modify, add, or delete environment variables as needed.

In addition to accessing the CLI and viewing the deployment log of your repository, which allows you to execute commands directly within your repository instance, you also have access to the "Cloud Console". This feature enables you to execute commands within your Docker instance. It proves useful when you require the installation of additional packages for deploying your repositories.

Moreover, upon starting your instance, the "apk" packages are automatically updated, and common development packages like git, npm, nodejs, and python are installed by default.

When the server is started after it has been shut down/restarted, the users' Docker instances and their repositories will automatically start.

When a user deletes their account, all associated deployments and repositories are permanently removed from the platform's database and file system. This deletion process extends to their Docker instance as well, ensuring a clean slate. It's important to note that this action is irreversible.

Regarding deployments, Quantum takes responsibility for deleting them from GitHub, but only if the deployment is exclusively linked to Quantum. If the repository contains deployments from other platforms like Vercel or Heroku, they remain unaffected. Additionally, any webhooks created to monitor repository commits are also deleted as part of this process.

## Custom domains for your deployments
Regardless of the service you have deployed (whether it’s a GitHub repository or a Docker application), once you have exposed the port, you can use a reverse proxy to, among other things, assign a domain to your application. For instance, with NGINX Reverse Proxy you can:

1. Use the public IP of the server where Quantum is hosted along with the exposed port of your service to set up the reverse proxy.

2. Alternatively, use the internal IP of the Docker container along with the internal port of your service.

If you’re using NGINX Reverse Proxy, you’ll need to create A records that point to the IP address of the server where Quantum is hosted (as shown in the attached Namecheap screenshot). Basically, it’s the same process you’ve been following all this time.

![NameCheap A Record](/screenshots/NameCheapARecord.png)

## Where are repositories and logs stored?
All platform repositories, along with their respective logs, are stored in `/var/lib/quantum`. This directory is automatically created whether you deploy with or without Docker.

Please be aware that all information related to your Quantum instance and users will persist in this directory. If you opt to use the software's CLI and select "delete database and related", this directory will be emptied accordingly.

In the **.env file** or its **.env.example counterpart**, you'll encounter a variable named `NODE_ENV`, accepting either `production` or `development` as values. Based on this assignment, or any value you specify, a corresponding directory will be generated within `/var/lib/quantum` to house the persistent data associated with that particular execution mode.

For instance, **when NODE_ENV is set to development**, data like logs and user repositories will reside in `/var/lib/quantum/development/`. Conversely, **when NODE_ENV is production**, the data will be located in `/var/ lib/quantum/production`.

![Quantum Storage Directory](/screenshots/QuantumStorageDir.png)

The way platform content is managed within `/var/lib/quantum/` is quite simple. Well, the `containers` directory stores a list of directories where each of them will have as its name the **id of the user** to whom a respective container belongs. Let's remember that each user will have their own Docker instance where they can host their repositories, and in the `containers` directory there will be the directories of all the users registered on the platform. When you enter a container, it will house two directories, `github-repos` and `logs`, where in the `github-repos` directory all the user's cloned repositories will be stored (which are named after the id that they have in the database), while in the `logs` directory there will be the records associated with these repositories already mentioned as well as the records associated with the user's `Cloud Console` within the platform.

## What happens when the server is closed?
When initiating the shutdown of the host server (Quantum Server), it won't close immediately. Instead, upon detecting the shutdown signal, the server systematically shuts down all Docker instances belonging to users. Consequently, their deployments and repositories are also gracefully closed. Only after all Docker instances on the platform are safely shut down does the server proceed to shut down successfully.

Similarly, upon restarting the server, the platform bootloader takes charge of mounting all users' Docker instances during server runtime. Once these Docker instances are successfully started, the bootloader proceeds to launch the repositories of all users within their respective instances. Please note that this startup process may require a few minutes, depending on your hardware specifications and the number of users on the platform.

If a server crash occurs, it won't simply shut down. Instead, the error will be displayed in the console, and the server will promptly initiate an automatic restart. If the error persists and another occurrence happens, the server will persistently attempt to restart until it can do so successfully. This proactive approach is vital for security reasons; it ensures that deployments aren't compromised due to server issues without the user's awareness. Therefore, the server diligently strives to recover and restart after any crash, safeguarding the continuity of operations.

## How can I migrate to new versions?
While there's currently no streamlined tool for easily uploading a new version, migrating to a fresh iteration of the platform isn't a daunting task. This is because crucial data pertaining to logs and repository information resides securely within the host server. Even if you were to remove the Docker container, delete the source code, or take any other action, your repositories and logs persist within "/var/lib/quantum/" and, of course, within your database.

Should you wish to transition to a newer version of Quantum, the process is straightforward. Simply retain the ".env" files located within the "client/" and "server/" directories. Once the updated Quantum version is cloned, reintegrate these files into their respective directories.

With these steps completed, all that's left is to redeploy—whether through Docker or from the source code. Everything will remain intact, as neither the database nor your files in "/var/lib/quantum/" will be affected.

## We'd love your feedback and support!
Your involvement is vital to make Quantum the best it can be. Here's how you can get involved:

- **Contribute**: Explore the codebase on GitHub, fix bugs, implement new features, and become a part of the development team.
- **Star/Fork**: Increase Quantum's visibility on GitHub by starring and forking the repository. This helps others discover our project.
- **Coffee**: If Quantum has become a valuable tool for you, consider showing your appreciation with a small donation on Ko-fi https://ko-fi.com/codewithrodi. Your support fuels our team's continued development efforts.
