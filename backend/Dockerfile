FROM node:22-slim

WORKDIR /app

# Instalar herramientas necesarias para compilar dependencias nativas
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Instalar dependencias (ahora node-gyp podrá compilar sin problema)
RUN npm install

COPY src/ ./src/
COPY .env* ./

RUN mkdir -p /app/db

EXPOSE 3000

CMD ["node", "src/server.js"]