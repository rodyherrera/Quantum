# Simplify Deployment with Our Cutting-Edge Open Source Platform 🚀
<div>
<a href="https://ko-fi.com/codewithrodi"> <img align="left" src="https://cdn.ko-fi.com/cdn/kofi3.png?v=3" height="33"   width="130" alt="Support Quantum!" /></a>
</div>
<br /> <br />

![Quantum Home Page](/screenshots/QuantumHomePage.png)

We assist you in hosting your applications, servers, and services on your own centralized hardware infrastructure, all conveniently located in one place. Our platform was conceived as an open-source alternative to renowned platforms like Vercel, Netlify, and Heroku. 

After creating an account on our platform, you'll be prompted to log in using your GitHub credentials. This step allows you to securely store your access token for cloning repositories, creating webhooks, and managing deployments – including creation, updating, and deletion. Once your GitHub account is connected, you'll gain full access to all the platform's features.

Quantum also offers a 'Cloud Shell' feature, ensuring every user on the platform has access to their own dedicated environment. Think of it as a client-server connection, enabling you to execute commands directly on your Virtual Private Server (VPS) or any other hosting environment where Quantum is deployed.

![Quantum Cloud Console](/screenshots/CloudConsole.png)

Similarly, every repository you have deployed on the platform comes with its own command line interface. This allows you to monitor the execution output of your service (referred to as logs) or execute specific commands as needed.

![Repository CLI](/screenshots/RepositoryCLI.png)

If you wish to make local changes—meaning alterations that don't necessitate a GitHub commit or application redeployment—the platform offers a file explorer feature. This tool enables you to read from and write to files within your repository. It's important to note that any changes made through this explorer will be overwritten if a commit is subsequently made to your repository. This occurs because commits replace the files with the data currently stored on GitHub.

![Repository File Explorer](/screenshots/RepositoryFileExplorer.png)

While Quantum offers a panel for configuring commands such as installing dependencies (e.g., "npm install"), building source code (e.g., "npm run build"), or starting your software (e.g., "npm run start"), it also provides a separate panel specifically for managing environment variables. It's worth noting that this isn't a manual process where you input variables and their values one by one. When the repository is cloned, Quantum automatically maps the environment variables, allowing you to assign their respective values later on. You have the flexibility to create, delete, and modify environment variables associated with the deployment of your repository as needed.

![Repository Environment Variables](/screenshots/RepositoryEnvironVariables.png)
![User Profile](/screenshots/UserProfile.png)
I've successfully **migrated all my frontend applications from Vercel and my various VPS services to Quantum**. The platform's ease of use and efficiency are evident in the 15 repositories I currently have deployed – a testament to my confidence in Quantum.

## Table of Contents
- [Features](#features)
- [Post-Installation Configuration](#post-installation-configuration)
- [Obtaining GitHub Client Secret and Client ID](#obtaining-github-client-secret-and-client-id)
- [Deploying with Docker](#deploying-with-docker)
- [Project Requirements](#project-requirements)
- [Installation](#installation)
- [Deploying Quantum](#deploying-quantum)
- [Building the client application](#building-the-client-application)
- [The Quantum CLI](#the-quantum-cli)
- [How does this work?](#how-does-this-work)
- [What happens when the server is closed?](#what-happens-when-the-server-is-closed)
- [We'd love your feedback and support!](#we-d-love-your-feedback-and-support)
  
## Features
- **Github Integration:** Securely connect your GitHub account to Quantum for repository access and management of deployments.
- **Cloud Shell:** Access a dedicated environment for executing commands directly on your Virtual Private Server (VPS) or hosting environment where Quantum is deployed.
- **Repository Command Line Interface (CLI):** Each deployed repository comes with its own CLI for monitoring execution output (logs) and executing specific commands.
- **File Explorer:** Make local changes within your repository without requiring a GitHub commit or application redeployment. Changes are overwritten upon subsequent commits.
- **Command Panel:** Configure commands such as dependency installation, source code building, and software startup within a dedicated panel.
- **Tailored User Experience:** The user interface (web-ui) is completely responsive, designed considering every detail, with the aim of giving you an optimal experience compared to other open-source alternatives of the same nature.
- **Environment Variable Management:** Manage environment variables associated with your deployment, with automatic mapping of variables upon repository cloning. Create, delete, and modify variables as needed.
- **Continuous deployment:** When a commit is made to the repository within Github, it is automatically redeployed to Quantum.
- **Service Status:** You can check the status of the server through the web-ui. It will determine if the server is working in optimal conditions or if it is overloaded.
- **Docker-Based Isolation:** Each user receives a dedicated Docker instance for their deployment, ensuring smooth operations and minimizing conflicts.

## Post-Installation Configuration
After cloning the repository and installing the dependencies for the client and server application, you will need to modify some environment variables.

Inside the "server" folder, there is the source code of the application that provides the platform API. You will find inside a file called ".env.example", which contains the environment variables that you must establish in the file. ".env" from the same directory:
```env
# NODE_ENV: Defines the server execution environment. 
NODE_ENV = development

# DOCKERS_CONTAINER_ALIASES: The content of the variable will indicate 
# the value that will be concatenated at the beginning of each container 
# name that is created for a specific user. Changing this value after 
# having already deployed and having your database with users can cause problems. 
# This value is the way to determine which container belongs to Quantum.
DOCKERS_CONTAINER_ALIASES = Quantum-Container

# DOCKER_APK_STARTER_PACKAGES: Initial packages to install once
# the user container is created.
DOCKER_APK_STARTER_PACKAGES = "git nodejs npm python3 py3-pip"

# DOMAIN: Specifies the base domain of the server. This is the 
# main access point for the application.
DOMAIN = www.backend-domain.com
# DOMAIN = http://127.0.0.1:80

# SECRET_KEY: Secret key used for encrypting 
# sensitive data. It's crucial for ensuring application security.
SECRET_KEY = 

# REGISTRATION_DISABLED: The value of the variable will indicate 
# whether third parties can create accounts within the platform, that 
# is, through the client application (webui) or through the API 
# provided by the server. By default this option is "true" indicating 
# that accounts cannot be created, so the system administrator creates 
# their account as "admin" from the CLI provided.
REGISTRATION_DISABLED = true

# CLIENT_HOST: Specifies the host of the application's 
# client. It's the access point for the user interface.
CLIENT_HOST = www.frontend-domain.com
# CLIENT_HOST = http://127.0.0.1:3030

# SERVER_PORT: The port on which the server 
# is listening for incoming requests.
SERVER_PORT = 8000

# SERVER_HOSTNAME: The hostname of the 
# server where the application is running.
SERVER_HOSTNAME = 0.0.0.0

# SESSION_SECRET: Secret key used for signing 
# and verifying the authenticity of user sessions.
SESSION_SECRET = 

# GITHUB_CLIENT_ID: Unique identifier 
# provided by GitHub for OAuth integration.
GITHUB_CLIENT_ID = 

# GITHUB_CLIENT_SECRET: Secret key provided by 
# GitHub for OAuth integration.
GITHUB_CLIENT_SECRET = 

# JWT_EXPIRATION_DAYS: Specifies the validity duration 
# of JWT tokens issued for user authentication.
JWT_EXPIRATION_DAYS = 7d

# CORS_ORIGIN: Defines allowed origins for 
# cross-origin resource sharing (CORS) requests. In 
# this case, it allows from any origin.
CORS_ORIGIN = *

# PRODUCTION_DATABASE: Specifies the production 
# database the application will connect to.
PRODUCTION_DATABASE = quantumcloud@production

# DEVELOPMENT_DATABASE: Specifies the development 
# database the application will connect to.
DEVELOPMENT_DATABASE = quantumcloud@development

# LOG_PATH_MAX_SIZE: The maximum size of the log 
# file before rotation occurs. (KYLOBYTES)
LOG_PATH_MAX_SIZE = 250

# MONGO_URI: MongoDB connection URI 
# used by the application.
MONGO_URI = mongodb://user:password@hostname:port

# MONGO_AUTH_SOURCE: Specifies the database to authenticate against.
# Use this if your authentication credentials are stored in a different database
# than the one you're connecting to. Commonly, this is set to "admin".
MONGO_AUTH_SOURCE = admin

# SMTP_HOST (OPTIONAL): Points to the host of the SMTP server. For example "smtp.myservice.com".
SMTP_HOST =

# SMTP_PORT (OPTIONAL): Set the port of your SMTP server, it 
# can be 465, 587 or simply 25, depending on your provider.
SMTP_PORT =

# SMTP_AUTH_USER (OPTIONAL): Enter the username of the account you want 
# to send emails with, for example: "no-reply@myquantumservice.com".
SMTP_AUTH_USER =

# SMTP_AUTH_PASSWORD (OPTIONAL): Enter the password to authenticate 
# with "SMTP_AUTH_USER".
SMTP_AUTH_PASSWORD = 

# WEBMASTER_MAIL (OPTIONAL): Enter the email address to which you want 
# important notifications to be sent about events within the server, such 
# as errors, reports, among other things.
WEBMASTER_MAIL = 
```
In the same way, within the "client" directory, you will find the same ".env.example" and ".env" files, obviously with different variables, which you must also set.
```bash
# VITE_SERVER: Address where the 
# Quantum backend is deployed.
VITE_SERVER = http://0.0.0.0:8000

# VITE_API_SUFFIX: Suffix to make API 
# calls, you should not change /api/v1.
VITE_API_SUFFIX = /api/v1
```
After establishing the environment variables for both the client and server applications, you will have what you need to deploy.

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

## Deploying with Docker
Before deploying to Docker, **make sure you have correctly configured the environment variables** associated with the client application as well as the backend server.

When cloning the repository, inside the generated folder (root), you will discover the "docker-compose.yml" file, which will allow you to deploy both the backend and frontend servers using the command "docker-compose up -d --build ".
```bash
# First, you must clone the repository.
git clone -b 1.0.4 https://github.com/rodyherrera/Quantum
```
After cloning the repository, we go inside the generated folder to run docker-compose.
```bash
docker-compose up -d --build 
```
After executing the command, Docker will deploy the frontend server (webui) and the backend.

The `docker-compose.yml` file contains the **port configuration for exposure**. The **backend server** is exposed to the host network through port `80`, while the **frontend application (webui)** is accessible via port `3030`. Modifying these ports is as simple as editing the "docker-compose.yml" file.

## Using NGINX as a reverse proxy
If you already have `NGINX` running on your server, **you will not be able to deploy the Quantum server on port 80**, since the port is already occupied, so you will have an error from Docker.

**To fix this**, simply change the exposure port to the server's host network within the `docker-compose.yml` file, and then reverse proxy through NGINX to that port, for example:
```yml
services:
  backend-server:
    ports:
      # - "80:80"
      - "8080:80"
```
We've commented out the line declaring port '80' exposure on the local network for accessing the Quantum server. Instead, `we're now utilizing port '8080' to redirect to port '80'` within the Docker container where the Quantum server is hosted.

Now this still won't work as we need to add the following configuration inside the existing **http{}** block in `/etc/nginx/nginx.conf`.
```conf
server {
    server_name _;

	location / {
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_pass http://0.0.0.0:8080;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
	}
    
    listen 80;
}
```
In the `server_name` directive, we use `_` to denote any requests not explicitly defined in NGINX. This configuration directs such requests to the address specified in `proxy_pass.` For instance, consider the domain `bar.example.com` which resolves to your server's IP address. Upon accessing this domain, NGINX intercepts the request. However, lacking a corresponding `server{}` block with `server_name bar.example. com` NGINX forwards the request to `http://0.0.0.0:8080`. This destination hosts instructions to handle the requested domain

Furthermore, you'll need to create another block akin to the preceding one. While the previous block facilitates managing various domains associated with your application, this new 'server{}' directive will exclusively handle requests directed to the quantum backend. This approach proves advantageous as it allows you to precisely define the server's domain and assign it an SSL certificate.

```conf
server{
	server_name quantum-server.your_domain.com;

	location / {
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_pass http://0.0.0.0:8080;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
	}
}
```

Notice how we now specify the `server_name` with the domain through which we intend to route requests to our backend server. Subsequently, we employ reverse proxying with the same configuration as the preceding block. Should you opt for **SSL encryption**, you have the option to manually configure it at this juncture. Alternatively, you can leverage tools such as `certbot --nginx` for streamlined certificate management.

Consider that you should adjust the endpoint set in the `VITE_SERVER` environment variable located in `client/.env`.

Now, you just have to reload the NGINX configuration for the changes to take effect.

```bash
sudo nginx -s reload
```

Problem solved!

## Project Requirements
To run this project, you'll need the following:
* **Docker:** Docker is required to run any containerized components of this project. Furthermore, if you intend to deploy Quantum using Docker, you'll require it as well. You can utilize the .sh script located within the project's root directory:
    ```bash
    bash install_docker.sh
    ```
* **Node.js 21 or higher:**  It is recommended to use nvm (Node Version Manager) to manage Node.js versions on your system. Here's how to install Node.js 21 using nvm:

    1. **Installing NVM:**
        ```bash
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        ```
        Or, if you prefer to use wget:
        ```bash
        wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
        ```

    2. **Close and reopen the terminal:** It is important to close and reopen the terminal after installing nvm for the changes to take effect.

    3. **Installing Node.js 20.11.1:** 
        ```bash
        nvm install 20.11.1
        ```

    4. **Set the default version:** Then, you can set the newly installed version as the default using the following command:
        ```bash
        nvm alias default 20.11.1
        ```
        
## Installation
You may prefer the all-in-one command, to run in your terminal, clone the repository and install dependencies.
```bash
git clone -b 1.0.4 https://github.com/rodyherrera/Quantum && cd Quantum && cd server && npm install --force && cd ../client &&  npm install --force
```

### Installation Guide
1. **Clone the Quantum Repository:**
    ```bash
    git clone -b 1.0.4 https://github.com/rodyherrera/Quantum
    ```
    This command clones the Quantum repository from GitHub to your local machine.
2. **Navigate to the Quantum Directory:**
    ```bash
    cd Quantum
    ```
    Move into the cloned repository directory.
3. **Install Server Dependencies:**
    ```bash
    cd server
    npm install --force
    ```
    This command installs the necessary dependencies for the server component of Quantum.
4. **Install Client Dependencies:**
    ```bash
    cd ../client
    npm install --force
    ```
    Navigate to the client directory within the Quantum repository and install the frontend dependencies.

## Deploying Quantum from Source
Once dependencies are installed, you'll be prepared to deploy Quantum on your server. To accomplish this, initiate the server application first, followed by the client application.

At this juncture in the documentation, it is assumed that both applications are already configured (environment variables).

```bash
# Navigate to the server directory.
cd server
# Start the backend server
npm run start
```

Now, with the server already running, we must deploy the client application.

```bash
# Navigate to the client directory.
cd client
# Start the client application
npm run dev
```

## Building the client application
In the preceding section, we deployed the client application alongside the server. However, the frontend application is currently running in development mode, initiated with "npm run dev." Should we aim to run this application in a production environment, we'll need to build it using Vite.
```bash
# Navigate to the client directory.
cd client
# Build the client application
npm run build
```
After running the "npm run build" command, a new directory named "dist" will be created. This directory houses the essential static files required for deploying your application in a production environment. I personally recommend using "serve," an npm package that facilitates deploying a static server within a specified directory—in this case, the generated "dist" directory.
```bash
# Install "serve" in case you don't have it.
npm install --global serve
# Deploy the server over "dist/"
serve -s -l PORT dist/
```
Replace "PORT" with the command where you want to deploy your application ;).

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
Once you have configured your repository, and subsequently deployed it on the network (you can check if it is accessible through the port it is running on), you can assign as many custom domains as you want through the user interface.

When you enter one or more domains, it will first be verified if it has already been generated, to avoid generating it again. If it does not exist, it will be generated through "certbot" automatically, to later adjust the NGINX configuration related to your repository.

Consider that, for this to work correctly, the domain must have a type A record where it points to the address of your server.

![NameCheap A Record](/screenshots/NameCheapARecord.png)
![Repository Domains](/screenshots/RepositoryDomains.png)

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
