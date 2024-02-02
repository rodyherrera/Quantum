const ERROR_CODES = {
    'Network Error': 'An error occurred while trying to communicate with the server, please try again or later.',

    'Authentication::EmailOrPasswordRequired': '',
    'Authentication::EmailOrPasswordIncorrect': '',
    'Authentication::Update::PasswordCurrentIncorrect': '',
    'Authentication::Delete::UserNotFound': '',
    'Authentication::Get::UserNotFound': '',
    'Authentication::Update::UserNotFound': '',
    'Authentication::Token::Required': '',
    'Authentication::User::NotFound': '',
    'Authentication::PasswordChanged': '',
    'Authentication::Unauthorized': '',
    'Authentication::Required': '',

    'User::Username::MinLength': '',
    'User::Username::MaxLength': '',
    'User::Username::Required': '',
    'User::Fullname::MinLength': '',
    'User::Fullname::MaxLength': '',    
    'User::Fullname::Required': '',
    'User::Email::Required': '',
    'User::Email::Unique': '',
    'User::Email::Validate': '',
    'User::Password::Required': '',
    'User::Password::MinLength': '',
    'User::Password::MaxLength': '',
    'User::PasswordConfirm::Required': '',
    'User::PasswordConfirm::Validate': '',

    'Repository::Name::Required': '',
    'Repository::Not::Found': '',
    'Repository::Action::Required': '',
    'Repository::File::Not::Exists': '',
    'Repository::File::Update::Content::Required': '',
    'Repository::Alias::MaxLength': '',
    'Repository::Alias::MinLength': '',
    'Repository::Name::Required': '',
    'Repository::User::Required': '',
    'Repository::URL::Required': '',

    'Deployment::Not::Found': '',
    'Deployment::Invalid::Action': '',
    'Deployment::User::Required': '',
    'Deployment::GithubDeploymentId::Required': '',
    'Deployment::Repository::Required': '',
    'Deployment::Not::Created': '',

    'Core::DeleteOne::RecordNotFound': '',
    'Core::UpdateOne::RecordNotFound': '',
    'Core::GetOne::RecordNotFound': '',
    'Core::PageOutOfRang': '',
    
    'Github::Missing::UserId': '',
    'Github::GithubId::Required': '',
    'Github::AccessToken::Required': '',
    'Github::Username::Required': '',
};

const DEFAULT_ERROR_MESSAGE = 'An unknown error has occurred, please try again or later.';

const errorCodeHandler = (errorCode) => {
    const readableError = ERROR_CODES?.[errorCode] || DEFAULT_ERROR_MESSAGE;
    return readableError;
};

export default errorCodeHandler;