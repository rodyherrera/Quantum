from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

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