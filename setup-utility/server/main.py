from fastapi import FastAPI, WebSocket, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, dotenv_values
from pathlib import Path
import requests
import os

app = FastAPI()
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/env')
async def get_env():
    env_vars = dotenv_values(env_path)
    return env_vars

@app.post('/env')
async def set_env(request: Request):
    try:
        new_vars = await request.json()
        with open(env_path, 'w') as env_file:
            for key, value in new_vars.items():
                env_file.write(f'{key} = {value}\n')
                os.environ[key] = value
        return {
            'status': 'success'
        }
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))

@app.get('/host-ip') 
async def get_host_ip():
    try:
        response = requests.get('https://api.ipify.org?format=json')
        response.raise_for_status()
        
        return {
            'status': 'success',
            'data': {
                'ip': response.json()['ip']
            }
        }
    except requests.RequestException as e:
        return {
            'status': 'error',
            'data': str(e)
        }
    
@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            pass
    except:
        await websocket.close()