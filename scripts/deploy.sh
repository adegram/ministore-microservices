#!/usr/bin/env bash
set -euo pipefail

kubectl apply -k k8s
kubectl rollout status deployment/product-service -n ministore
kubectl rollout status deployment/notification-service -n ministore
kubectl rollout status deployment/order-service -n ministore
kubectl rollout status deployment/api-gateway -n ministore
kubectl get pods,svc -n ministore
