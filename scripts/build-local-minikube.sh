#!/usr/bin/env bash
set -euo pipefail

REGISTRY_NAME="${1:-your-dockerhub-username}"

if ! command -v minikube >/dev/null 2>&1; then
  echo "minikube is required for this script."
  exit 1
fi

# Build images directly inside Minikube's Docker daemon.
eval "$(minikube docker-env)"

docker build -t "$REGISTRY_NAME/ministore-product-service:v1" ./services/product-service
docker build -t "$REGISTRY_NAME/ministore-notification-service:v1" ./services/notification-service
docker build -t "$REGISTRY_NAME/ministore-order-service:v1" ./services/order-service
docker build -t "$REGISTRY_NAME/ministore-api-gateway:v1" ./services/api-gateway

echo "Local Minikube images built successfully."
