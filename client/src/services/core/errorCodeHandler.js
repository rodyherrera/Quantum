const ERROR_CODES = {
    'Network Error': 'An error occurred while trying to communicate with the server, please try again or later.',

    'Authentication::EmailOrPasswordRequired': 'Email or password is required for authentication.',
    'Authentication::EmailOrPasswordIncorrect': 'Incorrect email or password, please try again.',
    'Authentication::Update::PasswordCurrentIncorrect': 'The current password provided is incorrect.',
    'Authentication::Delete::UserNotFound': 'User not found for deletion.',
    'Authentication::Get::UserNotFound': 'User not found.',
    'Authentication::Update::UserNotFound': 'User not found for update.',
    'Authentication::Token::Required': 'Authentication token is required.',
    'Authentication::User::NotFound': 'User not found.',
    'Authentication::PasswordChanged': 'Password has been changed successfully.',
    'Authentication::Unauthorized': 'Unauthorized access.',
    'Authentication::Required': 'Authentication is required.',

    'User::Username::MinLength': 'Username must be at least 8 characters long.',
    'User::Username::MaxLength': 'Username must not exceed 16 characters.',
    'User::Username::Required': 'Username is required.',
    'User::Fullname::MinLength': 'Full name must be at least 8 characters long.',
    'User::Fullname::MaxLength': 'Full name must not exceed 32 characters.',
    'User::Fullname::Required': 'Full name is required.',
    'User::Email::Required': 'Email is required.',
    'User::Email::Unique': 'Email must be unique.',
    'User::Email::Validate': 'Invalid email address.',
    'User::Password::Required': 'Password is required.',
    'User::Password::MinLength': 'Password must be at least 8 characters long.',
    'User::Password::MaxLength': 'Password must not exceed 16 characters.',
    'User::PasswordConfirm::Required': 'Password confirmation is required.',
    'User::PasswordConfirm::Validate': 'Password confirmation does not match the password.',

    'Repository::Name::Required': 'Repository name is required.',
    'Repository::Not::Found': 'Repository not found.',
    'Repository::Action::Required': 'Repository action is required.',
    'Repository::File::Not::Exists': 'Repository file does not exist.',
    'Repository::File::Update::Content::Required': 'Updated file content is required.',
    'Repository::Alias::MaxLength': 'Repository alias must not exceed 32 characters.',
    'Repository::Alias::MinLength': 'Repository alias must be at least 4 characters long.',
    'Repository::User::Required': 'Repository user is required.',
    'Repository::URL::Required': 'Repository URL is required.',

    'Deployment::Not::Found': 'Deployment not found.',
    'Deployment::Invalid::Action': 'Invalid deployment action.',
    'Deployment::User::Required': 'Deployment user is required.',
    'Deployment::GithubDeploymentId::Required': 'GitHub deployment ID is required.',
    'Deployment::Repository::Required': 'Deployment repository is required.',
    'Deployment::Not::Created': 'Deployment could not be created.',

    'Core::DeleteOne::RecordNotFound': 'Record not found for deletion.',
    'Core::UpdateOne::RecordNotFound': 'Record not found for update.',
    'Core::GetOne::RecordNotFound': 'Record not found.',
    'Core::PageOutOfRang': 'Page out of range.',

    'Github::Missing::UserId': 'GitHub user ID is missing.',
    'Github::GithubId::Required': 'GitHub ID is required.',
    'Github::AccessToken::Required': 'GitHub access token is required.',
    'Github::Username::Required': 'GitHub username is required.',
};

const DEFAULT_ERROR_MESSAGE = 'An unknown error has occurred, please try again or later.';

const errorCodeHandler = (errorCode) => {
    console.log(errorCode);
    const readableError = ERROR_CODES?.[errorCode] || DEFAULT_ERROR_MESSAGE;
    return readableError;
};

export default errorCodeHandler;