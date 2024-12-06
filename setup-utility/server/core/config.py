from dotenv import load_dotenv
from pathlib import Path
import secrets

env_path = Path(__file__).resolve().parent.parent.parent / '.env'

def init_env():
    load_dotenv(dotenv_path=env_path)

def generate_default_env_variables():
    return {
        "SECRET_KEY": secrets.token_hex(32),
        "SESSION_SECRET": secrets.token_hex(16),
        "ENCRYPTION_KEY": secrets.token_hex(32),
        "ENCRYPTION_IV": secrets.token_hex(16)
    }

def get_env_path():
    return env_path
