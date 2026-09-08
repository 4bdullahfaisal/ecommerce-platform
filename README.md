# Common Ground Commerce

A small, production-shaped ecommerce platform with a React/Vite storefront, Flask API, PostgreSQL, Redis/Celery, Docker Compose, Kubernetes manifests, Terraform scaffolding, and Prometheus/Grafana/Loki configuration.

## Run locally

Requirements: Docker Desktop, or Python 3.12+ and Node.js 20+ for running services separately.

```bash
docker compose up --build
```

Open http://localhost:3000. The API health check is at http://localhost:5000/health.

## Test and build

```bash
python -m pip install -r backend/requirements.txt
python -m pytest backend/tests
cd frontend && npm install && npm run build
```

## Deploy

The GitHub workflows assume a container registry and Kubernetes context are configured as repository secrets. Terraform creates the AWS foundation, while Kustomize overlays customize image tags and replica counts:

```bash
kubectl apply -k kubernetes/overlays/dev
terraform -chdir=terraform init
terraform -chdir=terraform plan -var-file=envs/dev.tfvars
```

Before production use, replace the development Kubernetes secret values and configure an external secret manager, TLS certificate, registry, and Terraform remote state.
