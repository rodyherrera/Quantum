from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import env, host, websocket

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(env.router, prefix="")
app.include_router(host.router, prefix="")
app.include_router(websocket.router, prefix="")
