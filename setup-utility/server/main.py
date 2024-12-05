from fastapi import FastAPI, WebSocket
import socket

app = FastAPI()

@app.get('/host_ip')
async def get_host_ip():
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    return {
        'status': 'success',
        'data': ip_address
    }

@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            pass
            # data = await websocket.receive_text()
            # await websocket.send_text(f'')
    except:
            await websocket.close()