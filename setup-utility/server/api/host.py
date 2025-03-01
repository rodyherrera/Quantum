from fastapi import APIRouter
from services.env import get_server_ip

router = APIRouter()

@router.get('/host-ip')
async def get_host_ip():
    return {
        'status': 'success',
        'data': { 'ip': get_server_ip() }
    }