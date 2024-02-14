# Quantum - Open source continuous deployment platform.
We assist you in hosting your applications, servers, and services on your own centralized hardware infrastructure, all conveniently located in one place. Our platform was conceived as an open-source alternative to renowned platforms like Vercel, Netlify, and Heroku. 

After creating an account on our platform, you'll be prompted to log in using your GitHub credentials. This step allows you to securely store your access token for cloning repositories, creating webhooks, and managing deployments – including creation, updating, and deletion. Once your GitHub account is connected, you'll gain full access to all the platform's features.

Quantum also offers a 'Cloud Shell' feature, ensuring every user on the platform has access to their own dedicated environment. Think of it as a client-server connection, enabling you to execute commands directly on your Virtual Private Server (VPS) or any other hosting environment where Quantum is deployed.

Similarly, every repository you have deployed on the platform comes with its own command line interface. This allows you to monitor the execution output of your service (referred to as logs) or execute specific commands as needed.

If you wish to make local changes—meaning alterations that don't necessitate a GitHub commit or application redeployment—the platform offers a file explorer feature. This tool enables you to read from and write to files within your repository. It's important to note that any changes made through this explorer will be overwritten if a commit is subsequently made to your repository. This occurs because commits replace the files with the data currently stored on GitHub.

While Quantum offers a panel for configuring commands such as installing dependencies (e.g., "npm install"), building source code (e.g., "npm run build"), or starting your software (e.g., "npm run start"), it also provides a separate panel specifically for managing environment variables. It's worth noting that this isn't a manual process where you input variables and their values one by one. When the repository is cloned, Quantum automatically maps the environment variables, allowing you to assign their respective values later on. You have the flexibility to create, delete, and modify environment variables associated with the deployment of your repository as needed.

### Installation
```bash
git clone https://github.com/rodyherrera/Quantum/ && cd Quantum && cd server && npm install --force && cd ../client &&  npm install --force
```

