import os
from pathlib import Path
from dotenv import dotenv_values
from core.config import get_env_path, generate_default_env_variables

def get_env_values():
    env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
    return dotenv_values(env_path)

def update_env_variables(new_vars: dict):
    current_vars = get_env_values()
    default_vars = generate_default_env_variables()

    current_vars.update(new_vars)
    
    for key, value in default_vars.items():
        if not current_vars.get(key):
            current_vars[key] = value

    with open(get_env_path(), 'w') as env_file:
        for key, value in current_vars.items():
            env_file.write(f'{key}={value}\n')
            os.environ[key] = value
