FROM python:3.12-slim

WORKDIR /app

# Install system dependencies needed for compilation (e.g. building packages if necessary)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose FastAPI's default port
EXPOSE 8000

# Run FastAPI app with reload disabled (or enabled via command override in docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
