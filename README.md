# Common Ground Commerce

A small, production-shaped ecommerce platform with a React/Vite storefront, Flask API, PostgreSQL, Redis/Celery, Docker Compose, Kubernetes manifests, Terraform scaffolding, and Prometheus/Grafana/Loki configuration.

## Project overview

This repository demonstrates an ecommerce system from browser to deployment:

```text
Browser -> React/Vite frontend -> Nginx -> Flask API -> PostgreSQL
											 |
											 -> Redis -> Celery worker

Prometheus collects API metrics -> Grafana displays dashboards
Loki is prepared for centralized logs
Docker Compose runs locally; Kubernetes runs the multi-service stack
Terraform describes optional AWS infrastructure
GitHub Actions tests, builds, and publishes container images
```

The application is intentionally usable without AWS, payment credentials, or a paid hosting account. Docker Compose is the simplest local environment. Minikube provides a local Kubernetes environment that mirrors the production shape.

## Repository map

### Application code

- `frontend/src/App.jsx`: storefront state, product filtering, shopping bag, checkout, and order confirmation UI.
- `frontend/src/components/ProductCard.jsx`: reusable product card component.
- `frontend/src/main.jsx`: React entry point.
- `frontend/src/styles.css`: responsive visual design and bag/confirmation panel styling.
- `frontend/index.html`: Vite document shell.
- `frontend/public/index.html`: static fallback document.
- `frontend/package.json`: frontend scripts and dependencies.
- `frontend/package-lock.json`: locked npm dependency versions.
- `frontend/vite.config.js`: Vite and React configuration.
- `frontend/Dockerfile`: builds the frontend and serves it through Nginx.
- `frontend/nginx.conf`: serves the SPA and proxies `/api` requests to the backend.

- `backend/app/app.py`: Flask application factory and API routes.
- `backend/app/models.py`: SQLAlchemy `Product` and `Order` models.
- `backend/app/utils.py`: initial product catalogue seed data.
- `backend/app/tasks.py`: Celery worker setup and optional SMTP order confirmations.
- `backend/app/__init__.py`: Python package marker.
- `backend/requirements.txt`: pinned Python dependencies.
- `backend/Dockerfile`: production-style Gunicorn image.
- `backend/pytest.ini`: backend test import configuration.
- `backend/tests/test_app.py`: API health, catalogue, and order tests.
- `backend/tests/test_models.py`: model serialization test.

### Local infrastructure

- `docker-compose.yml`: starts frontend, backend, PostgreSQL, Redis, and the Celery worker.
- `.env.example`: safe template for database, Redis, frontend, and optional SMTP settings.
- `.dockerignore`: prevents local build files from entering Docker contexts.
- `.gitignore`: excludes secrets, databases, caches, bytecode, node modules, builds, and Terraform state.

### Kubernetes

- `kubernetes/base/`: reusable namespace, configuration, secrets, deployments, services, ingress, storage, database, Redis, worker, and monitoring resources.
- `kubernetes/base/data.yaml`: PostgreSQL persistent volume claim and PostgreSQL/Redis deployments.
- `kubernetes/base/monitoring.yaml`: Prometheus, Grafana, Loki, services, and monitoring configuration.
- `kubernetes/base/kustomization.yaml`: base resource index.
- `kubernetes/overlays/dev/`: local development image names and tags.
- `kubernetes/overlays/staging/`: staging image and replica customization.
- `kubernetes/overlays/production/`: production replica customization.

### Cloud and observability

- `terraform/main.tf`: AWS provider and VPC, EKS, and monitoring module wiring.
- `terraform/variables.tf`: region, environment, cluster, and network inputs.
- `terraform/outputs.tf`: cluster and VPC outputs.
- `terraform/envs/*.tfvars`: dev, staging, and production variable values.
- `terraform/modules/vpc/`: VPC, availability zones, and private subnets.
- `terraform/modules/eks/`: EKS cluster and IAM role.
- `terraform/modules/monitoring/`: CloudWatch log group.
- `monitoring/prometheus/`: Prometheus scrape configuration and alerts.
- `monitoring/grafana/dashboards/`: dashboard definition.
- `monitoring/loki/`: Loki storage and schema configuration.

### GitHub automation

- `.github/workflows/ci.yaml`: tests, frontend build, Compose validation, Kubernetes rendering, and Docker builds.
- `.github/workflows/publish-images.yaml`: publishes backend and frontend images to GitHub Container Registry.
- `.github/workflows/deploy-dev.yaml`: manual development deployment when a cluster is available.
- `.github/workflows/deploy-staging.yaml`: staging deployment workflow.
- `.github/workflows/deploy-prod.yaml`: manually approved production deployment workflow.

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

Order confirmation is shown in the storefront and queued by the worker by default. To send real email, copy `.env.example` to `.env` and provide SMTP details, then rebuild:

```bash
cp .env.example .env
docker compose up -d --build
```

Use an SMTP provider or a Gmail app password. Never commit `.env` or expose the SMTP password in source control.

## Test and build

```bash
python -m pip install -r backend/requirements.txt
python -m pytest backend/tests
cd frontend && npm install && npm run build
```

The backend test suite should report four passing tests. The frontend build creates `frontend/dist`; this is generated output and is intentionally ignored by Git.

## API reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `GET` | `/api/products` | Return all products |
| `GET` | `/api/products/<id>` | Return one product |
| `POST` | `/api/orders` | Validate and create an order |
| `GET` | `/metrics` | Prometheus metrics |

An order request has this shape:

```json
{
	"email": "buyer@example.com",
	"items": [{"productId": 1, "quantity": 2}]
}
```

The API calculates the total from database prices rather than trusting a browser-supplied price. It returns an order with `confirmation: "queued"`; the Celery worker sends email only when SMTP is configured.

## GitHub Actions CI

The CI workflow runs automatically for pushes and pull requests. It:

- Runs the Flask tests
- Builds the Vite frontend
- Validates Docker Compose and Kubernetes manifests
- Builds both Docker images without pushing them

To use it, create a GitHub repository, push this project, and open the **Actions** tab. No AWS account or paid service is required for CI. The deployment workflows are intentionally separate and require a Kubernetes cluster and a `KUBE_CONFIG` repository secret.

### GitHub workflow sequence

1. A push or pull request starts `CI`.
2. Python dependencies are installed and backend tests run.
3. npm dependencies are installed and the frontend is built.
4. Docker Compose and all Kustomize overlays are validated.
5. Backend and frontend images are built without being deployed.
6. A push to `main` starts `Publish Images`, which pushes tagged images to GHCR.

The deployment workflows are deliberately separate. They should remain manual until a real Kubernetes cluster, registry image names, secrets, TLS, and a domain are configured.

## Optional cloud deployment

AWS is not required for local development. When you have an AWS account and credentials, the GitHub workflows assume a container registry and Kubernetes context are configured as repository secrets. Terraform creates the AWS foundation, while Kustomize overlays customize image tags and replica counts:

```bash
kubectl apply -k kubernetes/overlays/dev
terraform -chdir=terraform init
terraform -chdir=terraform plan -var-file=envs/dev.tfvars
```

Before production use, replace the development Kubernetes secret values and configure an external secret manager, TLS certificate, registry, and Terraform remote state.

## Completion status

Completed and verified locally:

- React/Vite storefront with filtering, bag, checkout, and confirmation UI.
- Flask API with product and order endpoints.
- PostgreSQL persistence and initial catalogue seeding.
- Redis/Celery background order confirmation task.
- Optional SMTP email delivery.
- Docker Compose local environment.
- Minikube Kubernetes deployment with storage and startup ordering.
- Prometheus metrics and alerts, Grafana datasource, and Loki configuration.
- GitHub Actions CI and GitHub Container Registry image publishing.
- Terraform syntax, initialization, and validation.

Not completed because it requires external infrastructure or credentials:

- AWS resource creation and paid cloud hosting.
- Real production domain and TLS certificate.
- External secret manager.
- Payment processor integration.
- Production email provider credentials.

These are deployment and business integrations, not blockers for local development or demonstration.

## Troubleshooting

### Containers are not running

```bash
docker compose ps
docker compose logs backend
docker compose up -d --build
```

### Kubernetes pods are pending

```bash
minikube status
kubectl get pods -n ecommerce
kubectl describe pod -n ecommerce <pod-name>
kubectl get events -n ecommerce --sort-by=.lastTimestamp
```

### The browser shows an old frontend

Rebuild the frontend container and refresh the browser:

```bash
docker compose up -d --build frontend
```

### Email is not received

The order can still complete without email. Check the worker log:

```bash
docker compose logs worker
```

If it says `SMTP is not configured`, add SMTP values to `.env`, then run `docker compose up -d --build`.

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
