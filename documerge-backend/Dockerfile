FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Garante que os arquivos .json de credenciais estejam acessíveis
# (assumindo que já estão dentro da pasta ./config)
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/config/gcs-service-account.json
ENV FIREBASE_CREDENTIALS_PATH=/app/config/projeto-advocacia-tales-firebase-adminsdk-fbsvc-969b4fefcf.json

# Cria diretório do banco de dados (caso necessário)
RUN mkdir -p src/database

# Set environment variables
ENV FLASK_APP=src/main.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app
ENV PORT=8080

# Expose the port Render expects
EXPOSE 8080

# Start Flask using Gunicorn (melhor para produção)
CMD ["gunicorn", "-b", "0.0.0.0:8080", "src.main:app"]
