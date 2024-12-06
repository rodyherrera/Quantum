from fastapi import APIRouter
from .env import router as env_router
from .host import router as host_router
from .websocket import router as websocket_router

router = APIRouter()
router.include_router(env_router)
router.include_router(host_router)
router.include_router(websocket_router)
