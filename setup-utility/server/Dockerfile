FROM python:3.12-slim

WORKDIR /app
COPY . .

WORKDIR /app/setup-utility/server

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "critical", "--proxy-headers", "--forwarded-allow-ips", "*", "--timeout-keep-alive", "65", "--access-log", "--no-server-header"]
