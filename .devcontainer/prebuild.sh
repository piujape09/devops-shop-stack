#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Prebuild script for GitHub Codespaces.
# Runs once during prebuild image creation (onCreateCommand) and again on
# prebuild updates (updateContentCommand). Anything cached here is baked into
# the prebuild snapshot so fresh Codespaces start in seconds.
#
# Best-effort: a failure in any single warming step prints a warning but does
# NOT abort the prebuild. We only care that the snapshot is *useful*, not that
# every cache is 100% populated.
# ---------------------------------------------------------------------------
set -u

warn() { echo "WARN: $*" >&2; }

# --- 1. Pre-pull container base images ------------------------------------
echo "==> Prebuild: pulling base Docker images..."
for img in \
  postgres:16-alpine \
  eclipse-temurin:21-jre-alpine \
  maven:3.9.9-eclipse-temurin-21 \
  node:20-alpine \
  nginx:1.27-alpine
do
  docker pull "$img" || warn "docker pull $img failed"
done

# --- 2. Warm Maven cache for every backend service ------------------------
echo "==> Prebuild: warming Maven cache..."
for svc in api-gateway user-service product-service order-service payment-service; do
  echo "    - $svc"
  (
    cd "backend-services/${svc}" || exit 0
    # `package` is more reliable than `dependency:go-offline` for fully
    # populating ~/.m2 because it forces real compile + test-compile resolution.
    mvn -B -ntp -DskipTests -T1C package
  ) || warn "maven warm for ${svc} failed (continuing)"
done

# --- 3. Frontend deps ------------------------------------------------------
echo "==> Prebuild: installing frontend dependencies..."
(
  cd frontend-react || exit 0
  if [ -f package-lock.json ]; then
    npm ci --no-audit --no-fund
  else
    npm install --no-audit --no-fund
  fi
) || warn "npm install for frontend-react failed (continuing)"

echo "==> Prebuild: done."
