#!/bin/bash
# ============================================================
# Fits Ops OS — Deploy Script
# Execute: chmod +x deploy.sh && ./deploy.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "======================================"
echo "  FITS OPS OS — Deploy para Internet  "
echo "======================================"
echo -e "${NC}"

# ── RAILWAY (Backend) ──────────────────────────────────────
echo -e "${YELLOW}[1/4] Login no Railway (abrirá o navegador)...${NC}"
railway login

echo -e "${YELLOW}[2/4] Criando projeto e fazendo deploy da API...${NC}"
cd apps/api

railway init --name "fits-ops-os-api"

# Configurar variáveis de ambiente
railway variables set \
  DATABASE_URL="<SUA_DATABASE_URL>" \
  NODE_ENV="production" \
  PORT="3001" \
  JWT_SECRET="<SEU_JWT_SECRET>" \
  JWT_EXPIRES_IN="8h" \
  OPENAI_API_KEY="<SUA_OPENAI_API_KEY>" \
  FRONTEND_URL="https://placeholder.vercel.app"

railway up --detach

echo -e "${GREEN}[✓] API enviada para Railway. Aguardando URL...${NC}"
sleep 5
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")

if [ -z "$RAILWAY_URL" ]; then
  echo -e "${YELLOW}Gerando domínio público...${NC}"
  railway domain
  RAILWAY_URL=$(railway domain 2>/dev/null || echo "")
fi

echo -e "${GREEN}API URL: https://${RAILWAY_URL}${NC}"

cd ../..

# ── VERCEL (Frontend) ──────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/4] Login no Vercel (abrirá o navegador)...${NC}"
vercel login

echo -e "${YELLOW}[4/4] Deploy do frontend para Vercel...${NC}"
cd apps/web

vercel --prod \
  --yes \
  --env NEXT_PUBLIC_API_URL="https://${RAILWAY_URL}"

VERCEL_URL=$(vercel ls --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['url'])" 2>/dev/null || echo "")

cd ../..

# ── Atualizar FRONTEND_URL no Railway ─────────────────────
if [ -n "$VERCEL_URL" ]; then
  echo ""
  echo -e "${YELLOW}Atualizando FRONTEND_URL no Railway com a URL do Vercel...${NC}"
  cd apps/api
  railway variables set FRONTEND_URL="https://${VERCEL_URL}"
  cd ../..
fi

# ── Resultado final ────────────────────────────────────────
echo ""
echo -e "${GREEN}"
echo "============================================"
echo "  DEPLOY CONCLUÍDO!"
echo "============================================"
echo -e "${NC}"
echo -e "  API (Railway):      ${GREEN}https://${RAILWAY_URL}${NC}"
echo -e "  Frontend (Vercel):  ${GREEN}https://${VERCEL_URL}${NC}"
echo ""
echo -e "  Login: admin@fitbank.com / admin123"
echo ""
