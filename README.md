# Ministore Microservices — Kubernetes Deployment

A containerized microservices application deployed to **Kubernetes on AWS EKS**, demonstrating how multiple backend services can be built, containerized, deployed, and connected using Kubernetes-native networking and service discovery.

## 🚀 Project Overview

**Ministore** is a Node.js-based microservices application consisting of several independently deployable services.

The project demonstrates practical experience with:

* **Docker** — Containerizing individual microservices
* **Kubernetes** — Deploying and managing application workloads
* **AWS EKS** — Running the Kubernetes cluster in AWS
* **Kubernetes Services** — Enabling communication between microservices
* **Service Discovery** — Allowing services to communicate using Kubernetes DNS
* **Microservices Architecture** — Separating application functionality into independently deployable services

## 🏗️ Architecture

The application consists of four main services:

| Service                  | Description                                                                  |   Port |
| ------------------------ | ---------------------------------------------------------------------------- | -----: |
| **API Gateway**          | Main entry point for client requests and communication with backend services |      — |
| **Product Service**      | Handles product-related operations                                           | `3001` |
| **Order Service**        | Handles order-related operations                                             | `3002` |
| **Notification Service** | Handles application notifications                                            | `3003` |

### Request Flow

```text
                         ┌─────────────────┐
                         │   User / Client │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   API Gateway   │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
             ┌────────────┐ ┌────────────┐ ┌───────────────┐
             │  Product   │ │   Order    │ │ Notification  │
             │  Service   │ │  Service   │ │    Service    │
             │   :3001    │ │   :3002    │ │    :3003      │
             └────────────┘ └────────────┘ └───────────────┘
                    │             │             │
                    └─────────────┴─────────────┘
                                  │
                         Kubernetes Service
                         Discovery / Networking
```

## ☸️ Kubernetes Architecture

Each microservice is deployed independently using Kubernetes **Deployments** and exposed internally through Kubernetes **Services**.

```text
AWS EKS Cluster
│
├── API Gateway
│   ├── Deployment
│   └── Service
│
├── Product Service
│   ├── Deployment
│   └── Service
│
├── Order Service
│   ├── Deployment
│   └── Service
│
└── Notification Service
    ├── Deployment
    └── Service
```

Kubernetes Services provide stable network endpoints for the microservices, allowing the API Gateway and other services to communicate without relying on individual Pod IP addresses.

## 🐳 Containerization

Each microservice is packaged as an independent Docker image.

```text
Product Service        → Docker Image
Order Service          → Docker Image
Notification Service   → Docker Image
API Gateway            → Docker Image
```

The images can then be pushed to a container registry and deployed into the EKS cluster.

## ☁️ AWS EKS

The application runs on an **Amazon Elastic Kubernetes Service (EKS)** cluster.

The deployment demonstrates the workflow:

```text
Source Code
     │
     ▼
Docker Build
     │
     ▼
Container Registry
     │
     ▼
AWS EKS
     │
     ├── API Gateway
     ├── Product Service
     ├── Order Service
     └── Notification Service
```

## 🛠️ Technology Stack

| Technology              | Purpose                           |
| ----------------------- | --------------------------------- |
| **Node.js**             | Microservices application runtime |
| **Docker**              | Application containerization      |
| **Kubernetes**          | Container orchestration           |
| **AWS EKS**             | Managed Kubernetes cluster        |
| **Kubernetes Services** | Service networking and discovery  |
| **kubectl**             | Kubernetes cluster management     |

## 📁 Project Structure

```text
ministore-microservices/
│
├── api-gateway/
│   ├── Dockerfile
│   └── ...
│
├── product-service/
│   ├── Dockerfile
│   └── ...
│
├── order-service/
│   ├── Dockerfile
│   └── ...
│
├── notification-service/
│   ├── Dockerfile
│   └── ...
│
├── k8s/
│   ├── api-gateway/
│   ├── product-service/
│   ├── order-service/
│   └── notification-service/
│
└── README.md
```

## ⚙️ Deployment

### 1. Build Docker Images

Build an image for each microservice:

```bash
docker build -t <registry>/<service-name>:<tag> .
```

### 2. Push Images to a Container Registry

```bash
docker push <registry>/<service-name>:<tag>
```

### 3. Deploy to Kubernetes

Apply the Kubernetes manifests:

```bash
kubectl apply -f k8s/
```

### 4. Verify Deployments

```bash
kubectl get deployments
```

### 5. Verify Pods

```bash
kubectl get pods
```

### 6. Verify Services

```bash
kubectl get services
```

## 🔍 Kubernetes Service Discovery

The microservices communicate through Kubernetes Services rather than directly connecting to Pod IP addresses.

For example:

```text
API Gateway
     │
     ├── http://product-service:3001
     │
     ├── http://order-service:3002
     │
     └── http://notification-service:3003
```

Kubernetes DNS resolves the service names to the appropriate Service endpoints within the cluster.

## 🎯 What This Project Demonstrates

This project demonstrates practical knowledge of:

* Designing a basic microservices architecture
* Creating Dockerfiles for Node.js applications
* Building and managing container images
* Deploying applications with Kubernetes
* Creating Kubernetes Deployments
* Creating Kubernetes Services
* Kubernetes internal networking
* Kubernetes service discovery
* Managing workloads with `kubectl`
* Deploying Kubernetes workloads to AWS EKS
* Running multiple independently deployable services in a Kubernetes environment

## 🔮 Future Improvements

Planned improvements include:

* [ ] Add Helm charts for application deployment
* [ ] Implement Kubernetes ConfigMaps and Secrets
* [ ] Add resource requests and limits
* [ ] Add health checks and readiness/liveness probes
* [ ] Add Horizontal Pod Autoscaling
* [ ] Implement an Ingress controller
* [ ] Add CI/CD with GitHub Actions or Jenkins
* [ ] Implement GitOps deployment with Argo CD
* [ ] Add Prometheus and Grafana monitoring
* [ ] Add centralized logging
* [ ] Implement Infrastructure as Code with Terraform

## 📌 DevOps Concepts Covered

```text
Docker
   ↓
Container Registry
   ↓
Kubernetes
   ↓
AWS EKS
   ↓
Kubernetes Services
   ↓
Service Discovery
   ↓
Microservices Communication
```

---

**Project Focus:** Containerization • Kubernetes • AWS EKS • Microservices • Service Discovery • DevOps
