# Quantum - Open source continuous deployment platform.
We assist you in hosting your applications, servers, and services on your own centralized hardware infrastructure, all conveniently located in one place. Our platform was conceived as an open-source alternative to renowned platforms like Vercel, Netlify, and Heroku. 

After creating an account on our platform, you'll be prompted to log in using your GitHub credentials. This step allows you to securely store your access token for cloning repositories, creating webhooks, and managing deployments – including creation, updating, and deletion. Once your GitHub account is connected, you'll gain full access to all the platform's features.

Quantum also offers a 'Cloud Shell' feature, ensuring every user on the platform has access to their own dedicated environment. Think of it as a client-server connection, enabling you to execute commands directly on your Virtual Private Server (VPS) or any other hosting environment where Quantum is deployed.

Similarly, every repository you have deployed on the platform comes with its own command line interface. This allows you to monitor the execution output of your service (referred to as logs) or execute specific commands as needed.

If you wish to make local changes—meaning alterations that don't necessitate a GitHub commit or application redeployment—the platform offers a file explorer feature. This tool enables you to read from and write to files within your repository. It's important to note that any changes made through this explorer will be overwritten if a commit is subsequently made to your repository. This occurs because commits replace the files with the data currently stored on GitHub.

While Quantum offers a panel for configuring commands such as installing dependencies (e.g., "npm install"), building source code (e.g., "npm run build"), or starting your software (e.g., "npm run start"), it also provides a separate panel specifically for managing environment variables. It's worth noting that this isn't a manual process where you input variables and their values one by one. When the repository is cloned, Quantum automatically maps the environment variables, allowing you to assign their respective values later on. You have the flexibility to create, delete, and modify environment variables associated with the deployment of your repository as needed.

### Features
- **Github Integration:** Securely connect your GitHub account to Quantum for repository access and management of deployments.
- **Cloud Shell:** Access a dedicated environment for executing commands directly on your Virtual Private Server (VPS) or hosting environment where Quantum is deployed.
- **Repository Command Line Interface (CLI):** Each deployed repository comes with its own CLI for monitoring execution output (logs) and executing specific commands.
- **File Explorer:** Make local changes within your repository without requiring a GitHub commit or application redeployment. Changes are overwritten upon subsequent commits.
- **Command Panel:** Configure commands such as dependency installation, source code building, and software startup within a dedicated panel.
- **Environment Variable Management:** Manage environment variables associated with your deployment, with automatic mapping of variables upon repository cloning. Create, delete, and modify variables as needed.
- **Continuous deployment:** When a commit is made to the repository within Github, it is automatically redeployed to Quantum.

### Project Requirements
To run this project, Node.js 21 or higher is required. It is recommended to use nvm (Node Version Manager) to manage Node.js versions on your system. Below are the steps to install Node.js 21 using nvm:
1. **Installing NVM:**
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    ```
    Or, if you prefer to use wget:
    ```bash
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    ```
2. **Close and reopen the terminal:** It is important to close and reopen the terminal after installing nvm for the changes to take effect.
3. **Installing Node.js 21.0.0:** 
    ```bash
    nvm install 21.0.0
    ```
### Installation
You may prefer the all-in-one command, to run in your terminal, clone the repository and install dependencies.
```bash
git clone https://github.com/rodyherrera/Quantum/ && cd Quantum && cd server && npm install --force && cd ../client &&  npm install --force
```

#### Installation Guide
1. **Clone the Quantum Repository:**
    ```bash
    git clone https://github.com/rodyherrera/Quantum/
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

