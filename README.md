# Common Ground Commerce

[![CI](https://github.com/4bdullahfaisal/ecommerce-platform/actions/workflows/ci.yaml/badge.svg)](https://github.com/4bdullahfaisal/ecommerce-platform/actions/workflows/ci.yaml)
[![Publish Images](https://github.com/4bdullahfaisal/ecommerce-platform/actions/workflows/publish-images.yaml/badge.svg)](https://github.com/4bdullahfaisal/ecommerce-platform/actions/workflows/publish-images.yaml)
[![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=20232a)](frontend/)
[![Python](https://img.shields.io/badge/backend-Python%203.12%2B-3776AB?logo=python&logoColor=white)](backend/)
[![Flask](https://img.shields.io/badge/API-Flask-000000?logo=flask&logoColor=white)](backend/app/app.py)
[![Docker](https://img.shields.io/badge/runtime-Docker%20Compose-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Kubernetes](https://img.shields.io/badge/orchestration-Kubernetes-326CE5?logo=kubernetes&logoColor=white)](kubernetes/)
[![Terraform](https://img.shields.io/badge/infrastructure-Terraform-844FBA?logo=terraform&logoColor=white)](terraform/)

> A complete, production-shaped ecommerce platform that runs locally for free and has a clear path toward Kubernetes and cloud deployment.

| Quick link | Purpose |
| --- | --- |
| [Run with Docker](#run-locally) | Start the complete local application |
| [Run with Kubernetes](#local-kubernetes-and-monitoring) | Run the production-shaped stack in Minikube |
| [View CI/CD](#github-actions-cicd) | Understand GitHub automation |
| [API reference](#api-reference) | Try the backend endpoints |
| [Project map](#project-map) | Find the code and infrastructure files |

Common Ground includes a React/Vite storefront, Flask API, PostgreSQL database, Redis/Celery background worker, Docker Compose environment, Kubernetes manifests, Terraform scaffolding, Prometheus metrics, Grafana dashboards, Loki configuration, and GitHub Actions automation.

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

## Technology stack

| Layer | Technology | What it does |
| --- | --- | --- |
| Storefront | React, Vite, CSS | Product browsing, filtering, bag, and checkout UI |
| Web server | Nginx | Serves the frontend and proxies `/api` requests |
| API | Python, Flask | Validates requests, applies business rules, and exposes JSON endpoints |
| Database | PostgreSQL, SQLAlchemy | Stores products and orders persistently |
| Background jobs | Redis, Celery | Queues and processes order confirmation work |
| Containers | Docker, Docker Compose | Reproducible local development and service orchestration |
| Platform | Kubernetes, Kustomize | Deploys and scales services in a cluster |
| Infrastructure | Terraform, AWS/EKS | Optional cloud infrastructure definition |
| Observability | Prometheus, Grafana, Loki | Metrics, dashboards, alerts, and log storage configuration |
| Automation | GitHub Actions, GHCR | Tests code and publishes container images |

## Project map

The project is organized by responsibility instead of one large application folder.

### Frontend: `frontend/`

| File | Responsibility |
| --- | --- |
| `src/App.jsx` | Storefront state, filtering, bag, checkout, and confirmation UI |
| `src/components/ProductCard.jsx` | Reusable product card |
| `src/main.jsx` | React entry point |
| `src/styles.css` | Responsive visual design and interaction states |
| `index.html` | Vite document shell |
| `public/index.html` | Static fallback document |
| `package.json` | npm scripts and frontend dependencies |
| `package-lock.json` | Locked npm versions |
| `vite.config.js` | Vite and React configuration |
| `Dockerfile` | Multi-stage frontend image build |
| `nginx.conf` | SPA fallback and backend API proxy |

### Backend: `backend/`

| File | Responsibility |
| --- | --- |
| `app/app.py` | Flask application factory, routes, validation, and metrics |
| `app/models.py` | SQLAlchemy `Product` and `Order` models |
| `app/utils.py` | Initial product catalogue seed data |
| `app/tasks.py` | Celery setup and optional SMTP order confirmations |
| `requirements.txt` | Pinned Python dependencies |
| `Dockerfile` | Gunicorn backend image |
| `pytest.ini` | Test import configuration |
| `tests/test_app.py` | Health, catalogue, and order API tests |
| `tests/test_models.py` | Model serialization test |

### Local runtime: root files

| File | Responsibility |
| --- | --- |
| `docker-compose.yml` | Starts frontend, API, PostgreSQL, Redis, and worker |
| `.env.example` | Safe template for local settings and optional SMTP |
| `.dockerignore` | Keeps local artifacts out of image build contexts |
| `.gitignore` | Excludes secrets, databases, caches, builds, and state |
| `README.md` | Project documentation and operating guide |

### Kubernetes: `kubernetes/`

| Path | Responsibility |
| --- | --- |
| `base/` | Shared namespace, config, secrets, workloads, services, ingress, storage, and monitoring |
| `base/data.yaml` | PostgreSQL persistent volume, PostgreSQL, and Redis deployments |
| `base/deployment.yaml` | Frontend, backend, and Celery worker deployments |
| `base/monitoring.yaml` | Prometheus, Grafana, Loki, services, and configs |
| `base/kustomization.yaml` | Base resource index |
| `overlays/dev/` | Local image names and development settings |
| `overlays/staging/` | Staging image and replica settings |
| `overlays/production/` | Production replica settings |

### Infrastructure and observability

| Path | Responsibility |
| --- | --- |
| `terraform/main.tf` | AWS provider and module wiring |
| `terraform/variables.tf` | Region, environment, cluster, and network inputs |
| `terraform/envs/*.tfvars` | Dev, staging, and production values |
| `terraform/modules/vpc/` | VPC, availability zones, and private subnets |
| `terraform/modules/eks/` | EKS cluster and IAM role |
| `terraform/modules/monitoring/` | CloudWatch log group |
| `monitoring/prometheus/` | Scrape configuration and alert rules |
| `monitoring/grafana/dashboards/` | Dashboard definition |
| `monitoring/loki/` | Loki storage and schema configuration |

### GitHub automation: `.github/workflows/`

| Workflow | Trigger | Responsibility |
| --- | --- | --- |
| `ci.yaml` | Pushes and pull requests | Tests, builds, and validates configuration |
| `publish-images.yaml` | Push to `main` or manual run | Publishes backend/frontend images to GHCR |
| `deploy-dev.yaml` | Manual | Applies the dev Kustomize overlay |
| `deploy-staging.yaml` | Manual or release candidate tag | Applies staging resources |
| `deploy-prod.yaml` | Manual with input | Applies production resources |

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
