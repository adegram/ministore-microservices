# Ministore Microservices Kubernetes Project

This project is a microservices-based application built with Node.js, Docker, Kubernetes, and AWS EKS. The project demonstrates how multiple backend services can be containerized, pushed to a Docker registry, and deployed into a Kubernetes cluster where they communicate with each other using Kubernetes Services.

## Project Overview

The application is made up of multiple services:

- API Gateway
- Product Service
- Order Service
- Notification Service

Each service is developed as a separate microservice, containerized with Docker, and deployed independently using Kubernetes Deployments and Services.

The API Gateway acts as the main entry point into the application. It communicates internally with the other services using Kubernetes service discovery.

## Architecture

User / Client
   |
API Gateway
   |
--------------------------------
| Product Service              |
| Order Service                |
| Notification Service         |
--------------------------------
````

Inside Kubernetes, the services communicate using internal service names such as:
```txt
http://product-service:3001
http://order-service:3002
http://notification-service:3003

```


## Services

| Service              | Purpose                               | Port |
| -------------------- | ------------------------------------- | ---- |
| API Gateway          | Main entry point for requests         | 8080 |
| Product Service      | Handles product-related requests      | 3001 |
| Order Service        | Handles order-related requests        | 3002 |
| Notification Service | Handles notification-related requests | 3003 |

## Project Folder Structure

project-root/
│
├── services/
│   ├── api-gateway/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │
│   ├── product-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │
│   ├── order-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │
│   └── notification-service/
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│
├── k8s/
│   ├── api-gateway-deployment.yaml
│   ├── product-deployment.yaml
│   ├── order-deployment.yaml
│   ├── notification-deployment.yaml
│   ├── api-gateway-service.yaml
│   ├── product-service.yaml
│   ├── order-service.yaml
│   ├── notification-service.yaml
│   └── api-gateway-configmap.yaml
│
└── .github/
    └── workflows/
        └── docker-ci-pipeline.yaml
```

## What Was Done

### 1. Created Multiple Microservices

The application was split into separate services:

```txt
api-gateway
product-service
order-service
notification-service
```

Each service has its own codebase and Dockerfile.

This allows each service to be built, deployed, scaled, and updated independently.

## 2. Created Kubernetes Deployments

Each microservice has its own Kubernetes Deployment.

Example API Gateway Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway-deployment
  labels:
    app: api-gateway
spec:
  replicas: 5
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: adehorizon/api-gateway:latest
        ports:
        - containerPort: 8080
```

The Deployment is responsible for:

* Creating pods
* Keeping the desired number of replicas running
* Restarting failed pods
* Rolling out new versions
* Managing updates to the application

## 3. Created Kubernetes Services

Each microservice has a Kubernetes Service.

Services provide stable network names for pods.

Pods are temporary and can be recreated with new IP addresses. A Service gives them a permanent internal DNS name.

Example Product Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: product-service
spec:
  type: ClusterIP
  selector:
    app: product-service
  ports:
  - port: 3001
    targetPort: 3001
```

The API Gateway can call the Product Service using:


http://product-service:3001
```

## 4. Used ClusterIP for Internal Communication

Internal microservices use:

```yaml
type: ClusterIP
```

This allows services to communicate inside the Kubernetes cluster without exposing them to the internet.

Example internal services:

```txt
product-service
order-service
notification-service
```

These services should usually remain private inside the cluster.

## 5. Used NodePort for External Testing

For local or simple external testing, the API Gateway can be exposed using a NodePort Service.

Example:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
spec:
  type: NodePort
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 32080
```

Meaning:

```txt
port: 80          = Kubernetes Service port
targetPort: 8080  = API Gateway container port
nodePort: 32080   = External node port
```

## 6. Added Environment Variables for Service Communication

The API Gateway needs to know where the other services are.

Instead of hardcoding service URLs directly in the application code, environment variables were added.

Example:

```yaml
env:
- name: PRODUCT_SERVICE_URL
  value: "http://product-service:3001"
- name: ORDER_SERVICE_URL
  value: "http://order-service:3002"
- name: NOTIFICATION_SERVICE_URL
  value: "http://notification-service:3003"
```

This allows the API Gateway code to call services like this:

```js
fetch(`${process.env.PRODUCT_SERVICE_URL}/products`)
```

## 7. Created a ConfigMap

A ConfigMap was created to store non-sensitive configuration values.

Correct ConfigMap example:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-gateway-config
data:
  PRODUCT_SERVICE_URL: "http://product-service:3001"
  ORDER_SERVICE_URL: "http://order-service:3002"
  NOTIFICATION_SERVICE_URL: "http://notification-service:3003"
```

The Deployment can load all values from the ConfigMap using:

```yaml
envFrom:
- configMapRef:
    name: api-gateway-config
```

Example inside the container spec:

```yaml
containers:
- name: api-gateway
  image: adehorizon/api-gateway:latest
  ports:
  - containerPort: 8080
  envFrom:
  - configMapRef:
      name: api-gateway-config
```

## 8. Added Resource Requests and Limits

Resource requests and limits were added to control CPU and memory usage.

Example:

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "250m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

Meaning:

```txt
requests = minimum resources Kubernetes reserves for the container
limits   = maximum resources the container can use
```

## 9. Discussed Health Checks

Two important Kubernetes health checks were discussed:

### readinessProbe

Checks if the application is ready to receive traffic.

If readiness fails, Kubernetes will not send traffic to that pod.

Example:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```

### livenessProbe

Checks if the application is still healthy.

If liveness fails, Kubernetes restarts the container.

Example:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 20
```

## 10. Discussed HPA

HPA means Horizontal Pod Autoscaler.

It automatically increases or decreases the number of pods based on traffic or resource usage.

Example:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

This means Kubernetes can scale the API Gateway between 2 and 10 pods depending on CPU usage.

## 11. Applied Kubernetes YAML Files

All Kubernetes YAML files inside the `k8s` folder can be applied at once using:

```bash
kubectl apply -f ./k8s
```

Or from inside the `k8s` folder:

```bash
kubectl apply -f .
```

To check deployments:

```bash
kubectl get deployments
```

To check pods:

```bash
kubectl get pods
```

To check services:

```bash
kubectl get services
```

To check services in a namespace:

```bash
kubectl get svc -n <namespace-name>
```

To check all namespaces:

```bash
kubectl get svc -A
```

## 12. Deleted Kubernetes Deployments

Multiple deployments can be deleted at once using:

```bash
kubectl delete deployment api-gateway-deployment product-deployment order-deployment notification-deployment
```

All resources in a folder can be deleted using:

```bash
kubectl delete -f ./k8s
```

## 13. Created GitHub Actions CI/CD Pipeline

A GitHub Actions workflow was created to:

* Checkout the code
* Set up Node.js
* Install dependencies
* Build each service
* Build Docker images
* Push images to Docker Hub

The workflow uses a matrix strategy so each microservice can be built and pushed separately.

## 14. Added Platform Support

The workflow builds images for:

```yaml
platforms: linux/amd64
```

This ensures the image can run on typical AWS EKS worker nodes.

For both AMD64 and ARM64 support, this can be changed to:

```yaml
platforms: linux/amd64,linux/arm64
```

## Useful Commands

### View local Docker images

```bash
docker images
```

### Apply Kubernetes files

```bash
kubectl apply -f ./k8s
```

### Restart deployments

```bash
kubectl rollout restart deployment api-gateway-deployment
kubectl rollout restart deployment product-deployment
kubectl rollout restart deployment order-deployment
kubectl rollout restart deployment notification-deployment
```

### Check pods

```bash
kubectl get pods
```

### Describe a pod

```bash
kubectl describe pod <pod-name>
```

### Check services

```bash
kubectl get svc
```

### Check deployments

```bash
kubectl get deployments
```

### Delete all resources from YAML files

```bash
kubectl delete -f ./k8s
```

## Key Kubernetes Concepts Used

### Deployment

A Deployment manages pods and keeps the desired number of replicas running.

### Pod

A Pod is the smallest deployable unit in Kubernetes. It runs one or more containers.

### Service

A Service gives pods a stable network name and load balances traffic to them.

### ClusterIP

Used for internal communication between services inside the cluster.

### NodePort

Used to expose a service through a port on the Kubernetes node.

### ConfigMap

Used to store non-sensitive configuration values such as internal service URLs.

### Resource Requests

Minimum CPU and memory Kubernetes reserves for a container.

### Resource Limits

Maximum CPU and memory a container is allowed to use.

### readinessProbe

Checks if a pod is ready to receive traffic.

### livenessProbe

Checks if a pod should be restarted.

### HPA

Automatically scales pods based on resource usage.

## Current Status

The project currently includes:
```txt
* Multiple Node.js microservices
* Dockerfiles for each service
* Kubernetes Deployments for each service
* Kubernetes Services for internal communication
* API Gateway service communication using environment variables
* ConfigMap for service URLs
* GitHub Actions CI/CD workflow
* Linux AMD64 image builds for AWS EKS compatibility
```

## Next Improvements
* Add monitoring with Prometheus and Grafana
* Add centralized logging
* Add automated deployment to EKS from GitHub Actions

## Important Notes

For AWS EKS, images must be available in a container registry such as Docker Hub or Amazon ECR.

Also, image architecture matters. If EKS nodes are `amd64`, the Docker images must support `linux/amd64`.

```