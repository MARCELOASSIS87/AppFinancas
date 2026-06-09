#!/usr/bin/env bash
set -euo pipefail

echo "=== Deploy na pasta: $(pwd) ==="

# CONFIGURAÇÃO MÍNIMA
COMPOSE_FILE="docker-compose.yml"   # troque se o nome for outro

# 1) Validar se é repositório Git
if [ ! -d .git ]; then
  echo "ERRO: esta pasta não é um repositório Git (.git não encontrado)."
  exit 1
fi

# 2) Validar se docker compose funciona
if ! docker compose version >/dev/null 2>&1; then
  echo "ERRO: 'docker compose' não está disponível ou não funciona."
  exit 1
fi

# 3) Validar se o arquivo de compose existe
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERRO: arquivo '$COMPOSE_FILE' não encontrado na pasta atual."
  exit 1
fi

echo "-> Atualizando código (git pull)..."
git pull --rebase

echo "-> Derrubando containers (docker compose down)..."
docker compose -f "$COMPOSE_FILE" down

echo "-> Subindo containers com build (docker compose up -d --build)..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "=== Pronto. Deploy atualizado com sucesso. ==="
