from pathlib import Path
import asyncio
import os
import pty
import subprocess
import platform
import psutil
import re
import signal

connected_clients = []
deploy_script_path = Path(__file__).resolve().parent.parent.parent.parent / 'scripts/deploy.sh'

def kill_port(port):
    try:
        if not isinstance(port, int) or port < 0 or port > 65535:
            raise ValueError(f'Invalid Port: {port}')
        for proc in psutil.process_iter(['pid', 'connections']):
            try:
                for conn in proc.connections('inet'):
                     if conn.laddr.port == port:
                        os.kill(proc.pid, signal.SIGKILL)
                        return True
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        return False
    except Exception as e:
        print(f'@setup-utility - kill port: {e}')
        return False

async def send_message_to_clients(message: str):
    if not connected_clients:
        return
    tasks = [client.send_text(message) for client in connected_clients]
    await asyncio.gather(*tasks)

async def execute_deploy_script():
    kill_port(27020)
    kill_port(5050)
    kill_port(7070)
    
    process = await asyncio.create_subprocess_exec(
        'bash', deploy_script_path,
        cwd=deploy_script_path.parent.parent,
        stdin=asyncio.subprocess.DEVNULL,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    ansi_escape = re.compile(r'(?:\x1B[@-_][0-?]*[ -/]*[@-~])')

    async def stream_output(stream):
        while True:
            output = await stream.readline()
            if not output:
                break
            message = output.decode('utf-8', errors='ignore')
            clean_message = ansi_escape.sub('', message)
            await send_message_to_clients(clean_message)

    await asyncio.gather(
        stream_output(process.stdout),
        stream_output(process.stderr)
    )

    return_code = await process.wait()
    if return_code != 0:
        await send_message_to_clients(f"Error {return_code}")