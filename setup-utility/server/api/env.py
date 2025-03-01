from fastapi import APIRouter, Request, HTTPException
from services.env import get_env_values, update_env_variables
from services.deploy import execute_deploy_script
import asyncio

router = APIRouter()

@router.get('/env')
async def get_env():
    return get_env_values()

@router.post('/env')
async def set_env(request: Request):
    try:
        new_vars = await request.json()
        update_env_variables(new_vars)
        
        asyncio.create_task(execute_deploy_script())

        return {'status': 'success'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
