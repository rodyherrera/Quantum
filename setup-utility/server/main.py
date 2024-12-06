from fastapi import FastAPI, WebSocket, Request, HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, dotenv_values
from pathlib import Path
import aiohttp
import os
import secrets
import asyncio

app = FastAPI()
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
deploy_script_path = env_path.parent / 'deploy.sh'
connected_clients = []

load_dotenv(dotenv_path=env_path)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

def generate_default_env_variables():
    return {
        "SECRET_KEY": secrets.token_hex(32),
        "SESSION_SECRET": secrets.token_hex(16), 
        "ENCRYPTION_KEY": secrets.token_hex(32),
        "ENCRYPTION_IV": secrets.token_hex(16)
    }

async def execute_deploy_script():
    process = await asyncio.create_subprocess_shell(
        f'bash {deploy_script_path}',
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    while True:
        line = await process.stdout.readline()
        if not line:
            break
        message = line.decode('utf-8').strip()
        await send_message_to_clients(message)

    await process.wait()

async def send_message_to_clients(message: str):
    for client in connected_clients:
        await client.send_text(message)

@app.get('/env')
async def get_env():
    env_vars = dotenv_values(env_path)
    return env_vars

@app.post('/env')
async def set_env(request: Request):
    try:
        new_vars = await request.json()
        current_vars = dotenv_values(env_path)
        
        default_vars = generate_default_env_variables()

        for key, value in default_vars.items():
            if len(current_vars.get(key, '')) == 0:
                current_vars[key] = value

        current_vars.update(new_vars)

        with open(env_path, 'w') as env_file:
            for key, value in current_vars.items():
                env_file.write(f'{key}={value}\n')
                os.environ[key] = value
        
        # Execute deploy.sh script and send output via WebSocket
        asyncio.create_task(execute_deploy_script())

        return {'status': 'success'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get('/host-ip') 
async def get_host_ip():
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get('https://api.ipify.org?format=json') as response:
                response.raise_for_status()
                data = await response.json()
                return {
                    'status': 'success',
                    'data': {'ip': data['ip']}
                }
        except aiohttp.ClientError as e:
            return {
                'status': 'error',
                'data': str(e)
            }

@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        await websocket.close()