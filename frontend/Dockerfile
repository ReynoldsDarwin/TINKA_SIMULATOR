# ── Etapa 1: Build ─────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite usa .env.production automáticamente en build
RUN npm run build

# ── Etapa 2: Servir con nginx ──────────────────────────
FROM nginx:alpine

# Copiar el build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx para SPA (React Router)
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
