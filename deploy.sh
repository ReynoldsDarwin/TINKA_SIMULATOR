#!/bin/bash
# deploy.sh — Script de despliegue para tinka.zettasky.com
# Uso: bash deploy.sh
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   TINKA SIMULATOR — Deploy en VPS${NC}"
echo -e "${GREEN}================================================${NC}"

# ── 1. Construir y levantar contenedores ──────────────────
echo -e "\n${YELLOW}[1/4] Construyendo imágenes Docker...${NC}"
docker compose build --no-cache

echo -e "\n${YELLOW}[2/4] Levantando contenedores...${NC}"
docker compose up -d

echo -e "\n${YELLOW}[3/4] Verificando estado de los contenedores...${NC}"
sleep 3
docker compose ps

# ── 2. Configurar nginx del VPS ───────────────────────────
echo -e "\n${YELLOW}[4/4] Configurando nginx del VPS...${NC}"

NGINX_CONF="/etc/nginx/sites-available/tinka.zettasky.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/tinka.zettasky.com"

if [ -f "$NGINX_CONF" ]; then
    echo -e "  ${GREEN}✓${NC} Config nginx ya existe, saltando copia."
else
    echo -e "  Copiando config nginx..."
    sudo cp nginx/tinka.zettasky.com.conf "$NGINX_CONF"
    sudo ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
    echo -e "  ${GREEN}✓${NC} Config nginx instalada."
fi

# Verificar sintaxis nginx
if sudo nginx -t 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Sintaxis nginx correcta."
    sudo systemctl reload nginx
    echo -e "  ${GREEN}✓${NC} nginx recargado."
else
    echo -e "  ${RED}✗${NC} Error en la configuración nginx. Revisa manualmente."
fi

# ── 3. Resumen ────────────────────────────────────────────
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}   ¡Deploy completado!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e ""
echo -e "  Frontend en host: ${YELLOW}http://127.0.0.1:8080${NC}"
echo -e "  Backend  en host: ${YELLOW}http://127.0.0.1:3001${NC}"
echo -e ""
echo -e "  Próximo paso — Obtener SSL (solo la primera vez):"
echo -e "  ${YELLOW}sudo certbot --nginx -d tinka.zettasky.com${NC}"
echo -e ""
echo -e "  Luego visita: ${GREEN}https://tinka.zettasky.com${NC}"
echo -e ""
echo -e "  Logs en tiempo real:"
echo -e "  ${YELLOW}docker compose logs -f${NC}"
