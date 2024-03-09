/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

const { Octokit } = require('@octokit/rest');
const { promisify } = require('util');
const simpleGit = require('simple-git');
const RepositoryHandler = require('@utilities/repositoryHandler');
const Deployment = require('@models/deployment');
const exec = promisify(require('child_process').exec);
const mongoose = require('mongoose');
const fs = require('fs');

/**
 *  This class is designed to interact with the GitHub API on behalf of a user,  
 *  handling repository-related actions within the Quantum Cloud platform.
 *
 * @param {User} user - The Quantum Cloud user object 
 * @param {Repository} repository - The Quantum Cloud repository object
*/
class Github{
    constructor(user, repository){
        this.user = user;
        this.repository = repository;
        this.octokit = new Octokit({ auth: user.github.accessToken });
    };

    /**
     * Deletes a locally-stored log file and a working directory associated with a repository.
     * Used as a cleanup mechanism in case of errors.
     *
     * @param {string} logPath - Path to the log file to be deleted.
     * @param {string} directoryPath - Path to the directory to be deleted.
     * @returns {Promise<void>} - Resolves if deletion is successful, rejects with an error if not.
    */
    static async deleteLogAndDirectory(logPath, directoryPath){
        try{
            if(logPath) await fs.promises.rm(logPath);
            await fs.promises.rm(directoryPath, { recursive: true });
        }catch (error){
            console.error('[Quantum Cloud]: CRITCAL ERROR -> Deletion failed:', error.message);
        }
    };
    
    /**
     * Clones a GitHub repository into a local directory.
     *
     * @returns {Promise<void>} - Resolves if the cloning process is successful, rejects with an error if not.
    */
    async cloneRepository() {
        const destinationPath = `/var/lib/quantum/containers/${this.user._id}/github-repos/${this.repository._id}`;
        try {
            const repositoryInfo = await this.octokit.repos.get({ 
                owner: this.user.github.username, 
                repo: this.repository.name 
            });
            const cloneEndpoint = repositoryInfo.data.private
                ? repositoryInfo.data.clone_url.replace('https://', `https://${this.user.github.accessToken}@`)
                : repositoryInfo.data.clone_url;
            await exec(`git clone ${cloneEndpoint} ${destinationPath}`);
        } catch (error) {
            console.error('[Quantum Cloud]: CRITICAL ERROR -> Cloning failed:', error.message);
        }
    }

    /**
     * Reads environment variables defined in `.env` files within a cloned repository.
     *
     * @returns {Promise<Object>} - An object containing key-value pairs of environment variables. 
    */
    async readEnvironmentVariables(){
        let envFiles = await simpleGit(`/var/lib/quantum/containers/${this.user._id}/github-repos/${this.repository._id}`).raw(['ls-tree', 'HEAD', '-r', '--name-only']);
        envFiles = envFiles.split('\n').filter(file => file.includes('.env'));
        const environmentVariables = {};
        for(const envFile of envFiles){
            const file = await simpleGit(`/var/lib/quantum/containers/${this.user._id}/github-repos/${this.repository._id}`).raw(['show', 'HEAD:' + envFile]);
            const lines = file.split('\n');
            lines.forEach(line => {
                if(line.trim() === '' || line.trim().startsWith('#')){
                    return;
                }
                const [key, value] = line.split('=');
                environmentVariables[key.trim()] = value?.trim() || '';
            });
        };
        return environmentVariables;
    };

    /**
     * Retrieves information about the latest commit on the main branch.
     *
     * @returns {Promise<Object>} - An object containing details about the commit (message, author, etc.).
    */
    async getLatestCommit(){
        const { data: commits } = await this.octokit.repos.listCommits({
            owner: this.user.github.username,
            repo: this.repository.name,
            per_page: 1,
            sha: 'main'
        });
        return commits[0];
    };

    /**
     * Creates a new deployment record in the database and updates old deployments.
     *
     * @param {number} githubDeploymentId - The ID of the newly created GitHub deployment.
     * @returns {Promise<Deployment>} - The newly created Deployment object.
    */
    async createNewDeployment(githubDeploymentId){
        const repositoryHandler = new RepositoryHandler(this.repository, this.repository.user);
        repositoryHandler.removeFromRuntime();
        const environmentVariables = await this.readEnvironmentVariables();
        const currentDeployment = this.repository.deployments.pop();
        if(currentDeployment){
            const { environment } = await Deployment.findById(currentDeployment._id);
            for(const [key, value] of environment.variables.entries()){
                if(!(key in environmentVariables)){
                    continue;
                }
                environmentVariables[key] = value;
            }
        }
        const latestCommit = await this.getLatestCommit();
        const newDeployment = new Deployment({
            user: this.user._id,
            githubDeploymentId,
            repository: this.repository._id,
            environment: {
                variables: environmentVariables
            },
            commit: {
                message: latestCommit.commit.message,
                author: {
                    name: latestCommit.commit.author.name,
                    email: latestCommit.commit.author.email
                },
                status: 'pending'
            }
        });
        await newDeployment.save();
        return newDeployment;
    };

    /**
     * Updates the deployment status on GitHub (e.g., "success", "failure", "pending").
     *
     * @param {number} deploymentId - The ID of the deployment to update.
     * @param {string} state - The new status (e.g., "in_progress", "success", "failure").
     * @returns {Promise<void>} - Resolves when the update is sent to GitHub.
    */
    async updateDeploymentStatus(deploymentId, state){
        await this.octokit.repos.createDeploymentStatus({
            owner: this.user.github.username,
            repo: this.repository.name,
            deployment_id: deploymentId,
            state
        });   
    };

    /**
     * Creates a new deployment on GitHub for the associated repository.
     * 
     * @returns {Promise<number>} - The ID of the newly created deployment.
     * @throws {RuntimeError} - If the deployment creation fails on GitHub's side.
    */
    async createGithubDeployment(){
        const { data: { id: deploymentId } } = await this.octokit.repos.createDeployment({
            owner: this.user.github.username,
            repo: this.repository.name,
            ref: 'main',
            auto_merge: false,
            required_contexts: [],
            environment: 'Production'
        });
        if(!deploymentId)
            throw new RuntimeError('Deployment::Not::Created', 500);
        return deploymentId;
    };

    /**
     * Retrieves detailed information about the associated GitHub repository.
     *
     * @returns {Promise<Object>} - An object containing repository details (e.g., name, description, owner, etc.).
    */
    async getRepositoryDetails(){
        const { data: repositoryDetails } = await this.octokit.repos.get({
            owner: this.user.github.username,
            repo: this.repository.name
        });
        return repositoryDetails;
    };

    /**
     * Fetches essential repository information, including the latest commit details.
     * Handles potential errors if the repository has been deleted.
     *
     * @returns {Promise<Object>} - An object containing:
     *   * branch: The default branch name
     *   * website: The repository's homepage URL (if defined)
     *   * latestCommitMessage: The message of the most recent commit
     *   * latestCommit: The date and time of the most recent commit
     * @returns {null} - If the repository is deleted on GitHub.
    */
    async getRepositoryInfo(){
        try{
            const latestCommit = await this.getLatestCommit();
            const details = await this.getRepositoryDetails();
            const information = {
                branch: details.default_branch,
                website: details.homepage,
                latestCommitMessage: latestCommit.commit.message,
                latestCommit: latestCommit.commit.author.date
            };
            return information;
        }catch(error){
            // TODO: Do it better.
            // There is no hook that allows an event to be fired when a repository 
            // is deleted (or so I think). For that reason, if a repository is 
            // deleted, an error will be thrown when trying to request information 
            // regarding it. By capturing and handling the error, we will 
            // remove the repository from the platform.
            if(error?.response?.data?.message === 'Not Found'){
                // I am using "mongoose.model" because, when importing 
                // "Repository" you get a circular import error.
                await mongoose.model('Repository').findByIdAndDelete(this.repository._id);
                return null;
            }
            throw error;
        }
    };

    /**
     * Creates a new webhook for the repository on GitHub, configured to trigger on 'push' events.
     *
     * @param {string} webhookUrl - The URL to which webhook events will be sent.
     * @param {string} webhookSecret - A secret used to verify the authenticity of webhook payloads.
     * @returns {Promise<number>} - The ID of the newly created webhook.
    */
    async createWebhook(webhookUrl, webhookSecret){
        const response = await this.octokit.repos.createWebhook({
            owner: this.user.github.username,
            repo: this.repository.name,
            name: 'web',
            config: {
                url: webhookUrl,
                content_type: 'json',
                secret: webhookSecret
            },
            events: ['push'],
            active: true
        });
        const { id } = response.data;
        return id;
    };

    /**
     * Deletes an existing webhook from the repository on GitHub. Handles cases where repositories might not have webhooks.
     *
     * @returns {Promise<void>} - Resolves if deletion is successful, or if there's no webhook to delete.
     * @throws {Error} - If the webhook deletion process encounters an error on GitHub's side.
    */
    async deleteWebhook(){
        // Some repositories will not have a webhook, and this is because if 
        // the repository is archived (Read-Only) it will not allow 
        // updates, therefore no hooks.
        if(!this.repository.webhookId) return;
        try{
            const response = await this.octokit.repos.deleteWebhook({
                owner: this.user.github.username,
                repo: this.repository.name,
                hook_id: this.repository.webhookId
            });
            return response;
        }catch (error){
            console.error('[Quantum Cloud]: Error deleting webhook:', error.message);
            throw error;
        }
    };

    /**
     * Lists existing deployments for the repository on GitHub.
     *
     * @returns {Promise<Array<Object>>} - An array of deployment objects, each containing deployment details.
    */
    async getRepositoryDeployments(){
        const { data: deployments } = await this.octokit.repos.listDeployments({
            owner: this.user.github.username,
            repo: this.repository.name
        });
        return deployments;
    };

    /**
     * Deletes a specified deployment on GitHub. 
     *
     * @param {number} deploymentId - The ID of the deployment to delete.
     * @returns {Promise<void>} - Resolves if the deployment deletion is successful.
    */
    async deleteRepositoryDeployment(deploymentId){
        await this.octokit.repos.deleteDeployment({
            owner: this.user.github.username,
            repo: this.repository.name,
            deployment_id: deploymentId
        });
    };

    /**
     * Orchestrates the deployment process for a repository. Includes 
     * cloning, creating a GitHub deployment, and updating 
     * the deployment status.
     *
     * @returns {Promise<Deployment>} - The newly created Deployment object, representing the deployment record in the Quantum Cloud system.
    */
    async deployRepository(){
        await this.cloneRepository();
        const githubDeploymentId = await this.createGithubDeployment();
        const newDeployment = await this.createNewDeployment(githubDeploymentId);
        newDeployment.url = `https://github.com/${this.user.github.username}/${this.repository.name}/deployments/${githubDeploymentId}`;
        newDeployment.status = 'pending';
        await newDeployment.save();
        await this.updateDeploymentStatus(githubDeploymentId, 'in_progress');
        return newDeployment;
    };
};

module.exports = Github;