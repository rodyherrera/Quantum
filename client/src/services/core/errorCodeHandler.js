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

const ERROR_CODES = {
    'Network Error': 'An error occurred while attempting to communicate with the server. Please check your internet connection and try again later.',

    'Authentication::EmailOrPasswordRequired': 'Both an email and password are required for authentication. Please provide both and try again.',
    'Authentication::EmailOrPasswordIncorrect': 'The provided email or password is incorrect. Please double-check your credentials and try again.',
    'Authentication::Update::PasswordCurrentIncorrect': 'The current password provided is incorrect. Please ensure you are using the correct current password for the update.',
    'Authentication::Delete::UserNotFound': 'User not found for deletion. Please verify the user exists before attempting deletion.',
    'Authentication::Get::UserNotFound': 'User not found. Please make sure the user exists and try again.',
    'Authentication::Update::UserNotFound': "User not found for update. Please check the user's existence before attempting an update.",
    'Authentication::Token::Required': 'Authentication token is required for this operation. Please provide a valid authentication token',
    'Authentication::User::NotFound': 'User not found. Please make sure the user exists and try again.',
    'Authentication::PasswordChanged': 'Password has been changed successfully.',
    'Authentication::Unauthorized': 'Unauthorized access. Please log in with the proper credentials.',
    'Authentication::Required': 'Authentication is required to perform this action. Please log in and try again.',
    'Authentication::Disabled': 'Authentication is disabled by the system administrator.',

    'User::Username::MinLength': 'Username must be at least 8 characters long.',
    'User::Username::MaxLength': 'Username must not exceed 16 characters.',
    'User::Username::Required': 'Username is required.',
    'User::Fullname::MinLength': 'Full name must be at least 8 characters long.',
    'User::Fullname::MaxLength': 'Full name must not exceed 32 characters.',
    'User::Fullname::Required': 'Full name is required.',
    'User::Email::Required': 'Email is required.',
    'User::Email::Unique': 'Email must be unique. The provided email address is already in use.',
    'User::Email::Validate': 'Invalid email address. Please provide a valid email.',
    'User::Password::Required': 'Password is required.',
    'User::Password::MinLength': 'Password must be at least 8 characters long.',
    'User::Password::MaxLength': 'Password must not exceed 16 characters.',
    'User::PasswordConfirm::Required': 'Password confirmation is required.',
    'User::PasswordConfirm::Validate': 'Password confirmation does not match the password. Please ensure both passwords match.',

    'Repository::Name::Required': 'Repository name is required.',
    'Repository::Not::Found': 'Repository not found. Please ensure the repository exists and try again.',
    'Repository::Action::Required': 'Repository action is required. Please specify the action to perform on the repository.',
    'Repository::File::Not::Exists': 'Repository file does not exist. Please check the file path and try again.',
    'Repository::File::Update::Content::Required': 'Updated file content is required for the repository. Please provide the updated content.',
    'Repository::Alias::MaxLength': 'Repository alias must not exceed 32 characters.',
    'Repository::Alias::MinLength': 'Repository alias must be at least 4 characters long.',
    'Repository::User::Required': 'Repository user is required. Please specify the user associated with the repository.',
    'Repository::URL::Required': 'Repository URL is required. Please provide the repository URL.',

    'Deployment::Not::Found': 'Deployment not found. Please ensure the deployment exists and try again.',
    'Deployment::Invalid::Action': 'Invalid deployment action. Please provide a valid action for the deployment.',
    'Deployment::User::Required': 'Deployment user is required. Please specify the user associated with the deployment.',
    'Deployment::GithubDeploymentId::Required': 'GitHub deployment ID is required. Please provide the GitHub deployment ID.',
    'Deployment::Repository::Required': 'Deployment repository is required. Please specify the repository associated with the deployment.',
    'Deployment::Not::Created': 'Deployment could not be created. Please check the deployment details and try again.',

    'Core::DeleteOne::RecordNotFound': 'Record not found for deletion. Please ensure the record exists before attempting deletion.',
    'Core::UpdateOne::RecordNotFound': "Record not found for update. Please check the record's existence before attempting an update.",
    'Core::GetOne::RecordNotFound': "Record not found. Please make sure the record exists and try again.",
    'Core::PageOutOfRang': 'Page out of range. Please provide a valid page number.',

    'Github::Missing::UserId': 'GitHub user ID is missing. Please provide the GitHub user ID.',
    'Github::GithubId::Required': 'GitHub ID is required. Please provide the GitHub ID.',
    'Github::AccessToken::Required': 'GitHub access token is required. Please provide a valid access token.',
    'Github::Username::Required': 'GitHub username is required. Please provide the GitHub username.',

    'Database::Cast::Error': 'Error encountered while converting data types in the database. This may occur when attempting to save data with an incompatible type.',
    'Database::Validation::Error': 'Validation error detected in the database. This typically happens when data fails to meet certain criteria or constraints specified in the database schema.',
    'Database::Duplicated::Fields': 'Duplicate fields found in the database. This error indicates an attempt to insert or update data that would result in duplicate entries for unique fields.',

    'JWT::Error': 'Error encountered while processing the JSON Web Token (JWT) for authentication. This could be due to various issues such as invalid token format or signature.',
    'JWT::Expired': 'The JSON Web Token (JWT) used for authentication has expired. Authentication tokens have a limited lifespan for security reasons, and this error indicates that the token is no longer valid due to expiration.'
};

const DEFAULT_ERROR_MESSAGE = 'An unknown error has occurred, please try again or later.';

const errorCodeHandler = (errorCode) => {
    console.error('[Quantum Client]: Error ->', errorCode);
    const readableError = ERROR_CODES?.[errorCode] || DEFAULT_ERROR_MESSAGE;
    return readableError;
};

export default errorCodeHandler;