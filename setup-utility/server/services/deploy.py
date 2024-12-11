from pathlib import Path
import asyncio
import os
import pty
import subprocess
import platform
import psutil
import re

connected_clients = []
deploy_script_path = Path(__file__).resolve().parent.parent.parent.parent / 'scripts/deploy.sh'

def kill_port(port):
    try:
        if not isinstance(port, int) or port < 0 or port > 65535:
            raise ValueError(f'Invalid Port: {port}')
        cmd = f'lsof -i :{port} -t'
        try:
            pid = subprocess.check_output(cmd, shell=True).decode().strip()
            if pid:
                os.kill(int(pid), 9)
                return True
        except subprocess.CalledProcessError:
            return False
        return False            
    except Exception as e:
        print(f'@setup-utility - kill port: {e}')

async def send_message_to_clients(message: str):
    for client in connected_clients:
        await client.send_text(message)

async def execute_deploy_script():
    master_fd, slave_fd = pty.openpty()
    kill_port(27020)
    kill_port(5050)
    kill_port(7070)
    process = await asyncio.create_subprocess_exec(
        'bash', str(deploy_script_path),
        cwd=deploy_script_path.parent,
        stdin=asyncio.subprocess.DEVNULL,
        stdout=slave_fd,
        stderr=slave_fd
    )

    os.close(slave_fd)

    loop = asyncio.get_running_loop()

    ansi_escape = re.compile(r'(?:\x1B[@-_][0-?]*[ -/]*[@-~])')

    try:
        while True:
            output = await loop.run_in_executor(None, os.read, master_fd, 1024)
            if not output:
                break
            message = output.decode('utf-8', errors='ignore')
            # Eliminar códigos ANSI de la salida
            clean_message = ansi_escape.sub('', message)
            print(clean_message)
            await send_message_to_clients(clean_message)
    finally:
        os.close(master_fd)

    return_code = await process.wait()
    if return_code != 0:
        await send_message_to_clients(f"Script falló con código de retorno {return_code}")