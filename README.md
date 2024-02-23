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

### Table of Contents
# Table of Contents

1. [Features](#features)
    - [Github Integration](#github-integration)
    - [Cloud Shell](#cloud-shell)
    - [Repository Command Line Interface (CLI)](#repository-command-line-interface-cli)
    - [File Explorer](#file-explorer)
    - [Command Panel](#command-panel)
    - [Tailored User Experience](#tailored-user-experience)
    - [Environment Variable Management](#environment-variable-management)
    - [Continuous Deployment](#continuous-deployment)
    - [Service Status](#service-status)
    - [Docker-Based Isolation](#docker-based-isolation)
2. [Project Requirements](#project-requirements)
    - [Node.js Installation](#nodejs-installation)
    - [Docker Installation](#docker-installation)
3. [Installation](#installation)
    - [Installation Guide](#installation-guide)
    - [Post-Installation Configuration](#post-installation-configuration)
    - [Obtaining GitHub Client Secret and Client ID](#obtaining-github-client-secret-and-client-id)
4. [Deploying Quantum](#deploying-quantum)
5. [Building the Client Application](#building-the-client-application)
6. [The Quantum CLI](#the-quantum-cli)
    - [User Account Creation](#user-account-creation)
7. [How Does This Work?](#how-does-this-work)
    - [Docker Instance Creation](#docker-instance-creation)
    - [Deployment Workflow](#deployment-workflow)
    - [Server Shutdown Process](#server-shutdown-process)
    - [Error Handling and Server Restart](#error-handling-and-server-restart)
8. [Feedback and Support](#feedback-and-support)
    - [Contribution](#contribution)
    - [Star/Fork](#starfork)
    - [Coffee](#coffee-donation)

### Features
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

### Project Requirements
To run this project, you'll need the following:

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

* **Docker:** Docker is required to run any containerized components of this project. Follow the installation instructions for your operating system:
    * **Linux:** https://docs.docker.com/engine/install/
    **If you have a Debian-based server (such as Ubuntu):**
      ```bash
      sudo apt-get update
      sudo apt-get install ca-certificates curl
      sudo install -m 0755 -d /etc/apt/keyrings
      sudo curl -fsSL [https://download.docker.com/linux/debian/gpg](https://download.docker.com/linux/debian/gpg) -o /etc/apt/keyrings/docker.asc
      sudo chmod a+r /etc/apt/keyrings/docker.asc

      echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] [https://download.docker.com/linux/debian](https://download.docker.com/linux/debian) \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      sudo apt-get update
      sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin 
      ```
    * **macOS:** https://docs.docker.com/desktop/install/mac-install/
    * **Windows:** https://docs.docker.com/desktop/install/windows-install/


### Installation
You may prefer the all-in-one command, to run in your terminal, clone the repository and install dependencies.
```bash
git clone -b 1.0.0 https://github.com/rodyherrera/Quantum && cd Quantum && cd server && npm install --force && cd ../client &&  npm install --force
```

#### Installation Guide
1. **Clone the Quantum Repository:**
    ```bash
    git clone -b 1.0.0 https://github.com/rodyherrera/Quantum
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
    
### Post-Installation Configuration
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
DOCKER_APK_STARTER_PACKAGES = "git docker nodejs npm python3 py3-pip"

# DOMAIN: Specifies the base domain of the server. This is the 
# main access point for the application.
DOMAIN = www.backend-domain.com

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

### Deploying Quantum
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

### Building the client application
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

### The Quantum CLI 
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

### How does this work?

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

### What happens when the server is closed?
When initiating the shutdown of the host server (Quantum Server), it won't close immediately. Instead, upon detecting the shutdown signal, the server systematically shuts down all Docker instances belonging to users. Consequently, their deployments and repositories are also gracefully closed. Only after all Docker instances on the platform are safely shut down does the server proceed to shut down successfully.

Similarly, upon restarting the server, the platform bootloader takes charge of mounting all users' Docker instances during server runtime. Once these Docker instances are successfully started, the bootloader proceeds to launch the repositories of all users within their respective instances. Please note that this startup process may require a few minutes, depending on your hardware specifications and the number of users on the platform.

If a server crash occurs, it won't simply shut down. Instead, the error will be displayed in the console, and the server will promptly initiate an automatic restart. If the error persists and another occurrence happens, the server will persistently attempt to restart until it can do so successfully. This proactive approach is vital for security reasons; it ensures that deployments aren't compromised due to server issues without the user's awareness. Therefore, the server diligently strives to recover and restart after any crash, safeguarding the continuity of operations.

### We'd love your feedback and support!
Your involvement is vital to make Quantum the best it can be. Here's how you can get involved:

- **Contribute**: Explore the codebase on GitHub, fix bugs, implement new features, and become a part of the development team.
- **Star/Fork**: Increase Quantum's visibility on GitHub by starring and forking the repository. This helps others discover our project.
- **Coffee**: If Quantum has become a valuable tool for you, consider showing your appreciation with a small donation on Ko-fi https://ko-fi.com/codewithrodi. Your support fuels our team's continued development efforts.
