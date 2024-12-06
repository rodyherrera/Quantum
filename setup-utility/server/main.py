from fastapi import FastAPI, WebSocket, Request, HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, dotenv_values
from pathlib import Path
import aiohttp
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
        current_vars = dotenv_values(env_path)

        # Update current variables with new values
        current_vars.update(new_vars)

        # Write updated variables back to .env file
        with open(env_path, 'w') as env_file:
            for key, value in current_vars.items():
                env_file.write(f'{key}={value}\n')
                os.environ[key] = value
        
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
    try:
        while True:
            await websocket.receive_text() 
    except WebSocketDisconnect:
        await websocket.close()