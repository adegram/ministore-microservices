# MiniStore Microservices on Kubernetes

MiniStore is a small but realistic microservice application you can deploy with Kubernetes.

It includes:

- `api-gateway` — public entrypoint for users
- `product-service` — returns product catalog data
- `order-service` — creates orders and calls the product + notification services
- `notification-service` — stores order notification messages
- Dockerfiles for every service
- Kubernetes Deployments, Services, ConfigMap, readiness probes, liveness probes, and optional Ingress
- GitHub Actions workflow for building and pushing Docker images

## Architecture

```text
Client
  |
  v
API Gateway :8080
  |---------------> Product Service :3001
  |---------------> Order Service :3002
                         |--------> Product Service :3001
                         |--------> Notification Service :3003
```

The API Gateway is the only service you expose to users. The other services remain internal Kubernetes `ClusterIP` services.

## Project structure

```text
ministore-microservices/
├── docker-compose.yml
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── product.yaml
│   ├── notification.yaml
│   ├── order.yaml
│   ├── api-gateway.yaml
│   ├── optional-ingress.yaml
│   └── kustomization.yaml
├── scripts/
│   ├── build-local-minikube.sh
│   └── deploy.sh
├── services/
│   ├── api-gateway/
│   ├── product-service/
│   ├── order-service/
│   └── notification-service/
└── .github/workflows/build-images.yml
```

## Run locally with Docker Compose

```bash
docker compose up --build
```

Test the gateway:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/products
```

Create an order:

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-001","quantity":2,"customerName":"Victor"}'
```

View orders and notifications:

```bash
curl http://localhost:8080/api/orders
curl http://localhost:8080/api/notifications
```

Stop everything:

```bash
docker compose down
```

## Deploy to Kubernetes locally with Minikube

Start Minikube:

```bash
minikube start
```

Replace the image placeholder with your Docker Hub username or any registry name you want to use locally:

```bash
export REGISTRY_NAME=your-dockerhub-username
grep -rl "your-dockerhub-username" k8s | xargs sed -i.bak "s/your-dockerhub-username/${REGISTRY_NAME}/g"
rm -f k8s/*.bak
```

Build the images inside Minikube:

```bash
chmod +x scripts/*.sh
./scripts/build-local-minikube.sh $REGISTRY_NAME
```

Deploy the manifests:

```bash
./scripts/deploy.sh
```

Expose the API Gateway locally:

```bash
kubectl port-forward -n ministore svc/api-gateway 8080:8080
```

Open a second terminal and test:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/products
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-002","quantity":1,"customerName":"Victor"}'
curl http://localhost:8080/api/notifications
```

## Deploy using Docker Hub or a cloud Kubernetes cluster

Build and push the images:

```bash
export DOCKERHUB_USERNAME=your-dockerhub-username

docker build -t $DOCKERHUB_USERNAME/ministore-product-service:v1 ./services/product-service
docker build -t $DOCKERHUB_USERNAME/ministore-notification-service:v1 ./services/notification-service
docker build -t $DOCKERHUB_USERNAME/ministore-order-service:v1 ./services/order-service
docker build -t $DOCKERHUB_USERNAME/ministore-api-gateway:v1 ./services/api-gateway

docker push $DOCKERHUB_USERNAME/ministore-product-service:v1
docker push $DOCKERHUB_USERNAME/ministore-notification-service:v1
docker push $DOCKERHUB_USERNAME/ministore-order-service:v1
docker push $DOCKERHUB_USERNAME/ministore-api-gateway:v1
```

Update the Kubernetes image names:

```bash
grep -rl "your-dockerhub-username" k8s | xargs sed -i.bak "s/your-dockerhub-username/${DOCKERHUB_USERNAME}/g"
rm -f k8s/*.bak
```

Deploy:

```bash
kubectl apply -k k8s
kubectl get pods,svc -n ministore
```

## Optional: Ingress

The file `k8s/optional-ingress.yaml` routes traffic from `ministore.local` to the API Gateway.

You need an Ingress controller such as NGINX before applying it.

```bash
kubectl apply -f k8s/optional-ingress.yaml -n ministore
```

For local testing, add this to `/etc/hosts` after your Ingress controller has an address:

```text
127.0.0.1 ministore.local
```

Then test:

```bash
curl http://ministore.local/api/products
```

## Useful Kubernetes commands

```bash
kubectl get pods -n ministore
kubectl get svc -n ministore
kubectl describe pod -n ministore <pod-name>
kubectl logs -n ministore deployment/api-gateway
kubectl logs -n ministore deployment/order-service
kubectl rollout restart deployment/api-gateway -n ministore
kubectl delete namespace ministore
```

## How to explain this project in an interview

“I built a Kubernetes-based microservice application with four services. The API Gateway exposes a single entrypoint while the backend services are kept internal using ClusterIP Services. The Order Service communicates with the Product Service to validate products and then sends an event-like request to the Notification Service after order creation. I containerized each service using Docker, created Kubernetes Deployments and Services, used a ConfigMap for environment-specific service URLs, and added readiness and liveness probes so Kubernetes can manage service health.”

## Next improvements

- Add PostgreSQL for persistent orders
- Add Redis or RabbitMQ for async notifications
- Add Prometheus metrics endpoint to each service
- Add Grafana dashboards
- Add Helm chart
- Add GitHub Actions deployment to EKS
- Add Horizontal Pod Autoscaler
- Add Kubernetes Secrets for sensitive configuration
