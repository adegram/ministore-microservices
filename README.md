```markdown
# Ministore Microservices Kubernetes Project

This project is a microservices-based application built with Node.js, Docker, Kubernetes, and AWS EKS. The project demonstrates how multiple backend services can be containerized, pushed to a Docker registry, and deployed into a Kubernetes cluster where they communicate with each other using Kubernetes Services.

---

## Project Overview

The application is made up of multiple services:
* **API Gateway**
* **Product Service**
* **Order Service**
* **Notification Service**

Each service is developed as a separate microservice, containerized with Docker, and deployed independently using Kubernetes Deployments and Services.

The API Gateway acts as the main entry point into the application. It communicates internally with the other services using Kubernetes service discovery.

---

## Architecture

```text
    User / Client
         |
    API Gateway
         |
---------------------------------
|  Product Service (3001)       |
|  Order Service (3002)         |
|  Notification Service (3003)  |
---------------------------------

```

Inside Kubernetes, the services communicate using internal service names such as:

```text
http://product-service:3001
http://order-service:3002
http://notification-service:3003

```

---

## Services

| Service | Purpose | Port |
| --- | --- | --- |
| API Gateway | Main entry point for requests | 8080 |
| Product Service | Handles product-related requests | 3001 |
| Order Service | Handles order-related requests | 3002 |
| Notification Service | Handles notification-related requests | 3003 |

---

## Project Folder Structure

```text
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

---

## What Was Done

### 1. Created Multiple Microservices

The application was split into separate services: `api-gateway`, `product-service`, `order-service`, and `notification-service`. Each service has its own codebase and Dockerfile, allowing them to be built, deployed, scaled, and updated independently.

### 2. Created Kubernetes Deployments

Each microservice has its own Kubernetes Deployment responsible for creating pods, maintaining replica sets, managing rollouts, and keeping the application healthy.

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

### 3. Created Kubernetes Services

Services provide stable network names (DNS) for pods since individual pod IPs are ephemeral and temporary.

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

### 4. Used ClusterIP for Internal Communication

Internal microservices use `type: ClusterIP`. This ensures they remain private and can only communicate inside the Kubernetes cluster without exposure to the public internet.

```

### 5. Added Environment Variables for Service Communication

Instead of hardcoding endpoint URLs directly in the application code, environment variables are mapped to allow dynamic routing:

```yaml
env:
- name: PRODUCT_SERVICE_URL
  value: "http://product-service:3001"
- name: ORDER_SERVICE_URL
  value: "http://order-service:3002"
- name: NOTIFICATION_SERVICE_URL
  value: "http://notification-service:3003"

```

This enables the API Gateway to interact with backing services natively:

```javascript
fetch(`${process.env.PRODUCT_SERVICE_URL}/products`)

```

### 6. Created a ConfigMap

A ConfigMap manages non-sensitive configuration parameters cleanly decoupled from the deployment code.

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

The Deployment loads all values safely using `envFrom`:

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

### 8. Added Resource Requests and Limits

Resource parameters control and protect CPU and memory allocation per pod instance.

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "250m"
  limits:
    memory: "256Mi"
    cpu: "500m"

```

* **Requests:** Minimum guaranteed resources Kubernetes reserves for the container.
* **Limits:** Maximum threshold ceiling resources the container can consume.

### 9. Configured Health Checks

Two crucial probes manage self-healing lifecycle behavior:

* **readinessProbe:** Checks if the app is ready to serve active traffic.
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10

```


* **livenessProbe:** Checks if the app is still healthy. Failed probes trigger automatic container restarts.
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 20

```



### 10. Implemented Horizontal Pod Autoscaler (HPA)

The HPA scales your pods up or down dynamically depending on traffic and compute requirements.

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

### 11. Core Deployment Pipeline

Apply all manifests synchronously inside the cluster:

```bash
kubectl apply -f ./k8s

```

Verify cluster statuses:

```bash
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get svc -n <namespace-name>
kubectl get svc -A

```

### 12. Deleting Resources

```bash
# Delete specific deployments
kubectl delete deployment api-gateway-deployment product-deployment order-deployment notification-deployment

# Clean up all resources in the k8s folder
kubectl delete -f ./k8s

```

### 13. GitHub Actions CI/CD Pipeline

The included workflow automatically checks out codebase, sets up Node runtime environments, processes application packages, and uses a build matrix strategy to build and push individual microservice Docker images to Docker Hub safely.

### 14. Architecture Platform Support

The default build targets:

```yaml
platforms: linux/amd64

```

For explicit multi-architecture support (e.g., both Intel/AMD and ARM nodes), use:

```yaml
platforms: linux/amd64,linux/arm64

```

---

## Useful Commands Cheat Sheet

| Command | Action |
| --- | --- |
| `docker images` | View local Docker image cache |
| `kubectl apply -f ./k8s` | Apply all manifests in the folder |
| `kubectl rollout restart deployment <name>` | Force restart running deployment instances |
| `kubectl get pods` | View status of active pods |
| `kubectl describe pod <pod-name>` | Inspect specific logs and lifecycle debug parameters |
| `kubectl get svc` | List details of running Kubernetes services |
| `kubectl delete -f ./k8s` | Wipe all managed folder resources from the cluster |

---

## Key Kubernetes Concepts Used

* **Deployment:** Manages declarative configuration states for Pods and ReplicaSets.
* **Pod:** The smallest execution unit running your application containers.
* **Service:** Exposes an application running on a set of Pods as a network service.
* **ClusterIP:** Default service type; limits visibility strictly within the cluster.
* **NodePort:** Exposes the Service on each Node's IP at a static port.
* **ConfigMap:** Inject external decoupled environment configurations to pods.
* **Resource Controls:** Requests (allocated baseline) and Limits (hard cap parameters).
* **Probes:** Custom health metrics validation via Liveness and Readiness tags.
* **HPA:** Auto-scaler tuning replica counts based on metrics observation.

---

## Project Status & Next Steps

### Current Status

* [x] Multiple Node.js microservices setup
* [x] Custom Dockerfiles per microservice
* [x] Kubernetes Deployments & ClusterIP networking
* [x] Environment variable configurations managed via ConfigMaps
* [x] Automated Multi-Matrix GitHub Actions CI pipeline

### Planned Improvements

* [ ] Integrate Prometheus and Grafana cluster monitoring metrics
* [ ] Configure centralized cluster-wide logging aggregation
* [ ] Implement full automated continuous deployment (CD) workflows straight into EKS via GitHub Actions

---

## Important Notes

> ⚠️ **AWS EKS Requirements:** Images must be hosted on an accessible registry like Docker Hub or Amazon ECR. Ensure your target image architecture tags exactly match your running EKS Worker node types (e.g., `linux/amd64` or `linux/arm64`).

```

```