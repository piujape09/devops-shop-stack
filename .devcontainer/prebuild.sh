#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Prebuild script for GitHub Codespaces.
# Runs once during prebuild image creation (onCreateCommand) and again on
# prebuild updates (updateContentCommand). Anything cached here will be
# baked into the prebuild snapshot, so fresh Codespaces start in seconds.
# ---------------------------------------------------------------------------
set -euo pipefail

echo "==> Prebuild: pulling base Docker images in parallel..."
docker pull postgres:16-alpine                              &
docker pull eclipse-temurin:21-jre-alpine                   &
docker pull maven:3.9.9-eclipse-temurin-21                  &
docker pull node:20-alpine                                  &
docker pull nginx:1.27-alpine                               &
wait

echo "==> Prebuild: warming Maven cache for all backend services in parallel..."
SERVICES=(api-gateway user-service product-service order-service payment-service)
pids=()
for svc in "${SERVICES[@]}"; do
  (
    cd "backend-services/${svc}"
    # Pull every dependency + plugin jar into ~/.m2 without compiling tests.
    mvn -B -ntp -DskipTests dependency:go-offline
  ) &
  pids+=($!)
done
for pid in "${pids[@]}"; do wait "${pid}"; done

echo "==> Prebuild: installing frontend dependencies..."
(
  cd frontend-react
  npm ci --no-audit --no-fund
)

echo "==> Prebuild: complete. Snapshot will include:"
echo "    - Docker base images (postgres, temurin, maven, node, nginx)"
echo "    - ~/.m2 with all Maven deps for 5 services"
echo "    - frontend-react/node_modules"
