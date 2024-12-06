import os
import secrets
from dotenv import dotenv_values
from core.config import env_path

def generate_default_env_variables():
    return {
        "SECRET_KEY": secrets.token_hex(32),
        "SESSION_SECRET": secrets.token_hex(16),
        "ENCRYPTION_KEY": secrets.token_hex(32),
        "ENCRYPTION_IV": secrets.token_hex(16)
    }

def get_env_values():
    return dotenv_values(env_path)

def update_env_variables(new_vars: dict):
    current_vars = get_env_values()
    default_vars = generate_default_env_variables()

    current_vars.update(new_vars)
    
    for key, value in default_vars.items():
        if not current_vars.get(key):
            current_vars[key] = value

    with open(env_path, 'w') as env_file:
        for key, value in current_vars.items():
            env_file.write(f'{key}={value}\n')
            os.environ[key] = value
