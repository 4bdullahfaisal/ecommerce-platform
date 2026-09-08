# Common Ground Commerce

A small, production-shaped ecommerce platform with a React/Vite storefront, Flask API, PostgreSQL, Redis/Celery, Docker Compose, Kubernetes manifests, Terraform scaffolding, and Prometheus/Grafana/Loki configuration.

## Run locally

Requirements: Docker Desktop, or Python 3.12+ and Node.js 20+ for running services separately.

```bash
docker compose up --build
```

Open http://localhost:3000. The API health check is at http://localhost:5000/health.

This local setup does not require AWS, a cloud account, or payment credentials. To stop it:

```bash
docker compose down
```

To start it again later:

```bash
docker compose up -d --build
```

## Test and build

```bash
python -m pip install -r backend/requirements.txt
python -m pytest backend/tests
cd frontend && npm install && npm run build
```

## GitHub Actions CI

The CI workflow runs automatically for pushes and pull requests. It:

- Runs the Flask tests
- Builds the Vite frontend
- Validates Docker Compose and Kubernetes manifests
- Builds both Docker images without pushing them

To use it, create a GitHub repository, push this project, and open the **Actions** tab. No AWS account or paid service is required for CI. The deployment workflows are intentionally separate and require a Kubernetes cluster and a `KUBE_CONFIG` repository secret.

## Optional cloud deployment

AWS is not required for local development. When you have an AWS account and credentials, the GitHub workflows assume a container registry and Kubernetes context are configured as repository secrets. Terraform creates the AWS foundation, while Kustomize overlays customize image tags and replica counts:

```bash
kubectl apply -k kubernetes/overlays/dev
terraform -chdir=terraform init
terraform -chdir=terraform plan -var-file=envs/dev.tfvars
```

Before production use, replace the development Kubernetes secret values and configure an external secret manager, TLS certificate, registry, and Terraform remote state.

## Local Kubernetes and monitoring

The same application can run locally in Minikube without AWS:

```bash
minikube start --driver=docker
minikube image load ecommerce-backend:latest
minikube image load ecommerce-frontend:latest
kubectl apply -k kubernetes/overlays/dev
kubectl get pods -n ecommerce
```

The dev stack includes the frontend, Flask API, PostgreSQL, Redis, Celery worker, Prometheus, Grafana, and Loki. To inspect the API and dashboards:

```bash
kubectl port-forward -n ecommerce service/frontend 3001:80
kubectl port-forward -n ecommerce service/backend 5001:5000
kubectl port-forward -n ecommerce service/prometheus 9090:9090
kubectl port-forward -n ecommerce service/grafana 3002:3000
```

Open `http://localhost:3001`, `http://localhost:9090`, or `http://localhost:3002`. To remove the local Kubernetes application:

```bash
kubectl delete namespace ecommerce
```
