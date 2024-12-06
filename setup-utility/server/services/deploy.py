import asyncio
from pathlib import Path

connected_clients = []
deploy_script_path = Path(__file__).resolve().parent.parent.parent.parent / 'deploy.sh'

async def send_message_to_clients(message: str):
    for client in connected_clients:
        await client.send_text(message)

async def execute_deploy_script():
    process = await asyncio.create_subprocess_shell(
        f'bash {deploy_script_path}',
        cwd=deploy_script_path.parent,
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
