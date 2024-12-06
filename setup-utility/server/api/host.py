from fastapi import APIRouter
from services.host import fetch_host_ip

router = APIRouter()

@router.get('/host-ip')
async def get_host_ip():
    try:
        ip = await fetch_host_ip()
        return {
            'status': 'success',
            'data': {'ip': ip}
        }
    except Exception as e:
        return {
            'status': 'error',
            'data': str(e)
        }
