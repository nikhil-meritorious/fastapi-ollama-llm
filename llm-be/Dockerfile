FROM python:3.10-alpine AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

FROM python:3.10-alpine

WORKDIR /app

COPY --from=builder /app /app

RUN pip install --no-cache-dir --upgrade -r requirements.txt

EXPOSE 8001

CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8001"]
