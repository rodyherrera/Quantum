import aiohttp

async def fetch_host_ip():
    async with aiohttp.ClientSession() as session:
        async with session.get('https://api.ipify.org?format=json') as response:
            response.raise_for_status()
            data = await response.json()
            return data['ip']
