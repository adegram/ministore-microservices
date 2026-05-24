# MiniStore Microservices on Kubernetes

MiniStore is a small but realistic microservice application you can deploy with Kubernetes.

It includes:

- `api-gateway` — public entrypoint for users
- `product-service` — returns product catalog data
- `order-service` — creates orders and calls the product + notification services
- `notification-service` — stores order notification messages
- Dockerfiles for every service
- Kubernetes Deployments, Services, ConfigMap.

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
├── scripts/
│   ├── build-local-minikube.sh
│   └── deploy.sh
├── services/
│   ├── api-gateway/
│   ├── product-service/
│   ├── order-service/
│   └── notification-service/

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

## Next improvements

- Add PostgreSQL for persistent orders
- Add Redis or RabbitMQ for async notifications
- Add Prometheus metrics endpoint to each service
- Add Grafana dashboards
- Add Helm chart
- Add GitHub Actions deployment to EKS
- Add Horizontal Pod Autoscaler
- Add Kubernetes Secrets for sensitive configuration
