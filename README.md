# Common Ground Commerce

[![CI](https://github.com/4bdullahfaisal/ecommerce-platform/actions/workflows/ci.yaml/badge.svg)](https://github.com/4bdullahfaisal/ecommerce-platform/actions/workflows/ci.yaml)
[![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=20232a)](frontend/)
[![Python](https://img.shields.io/badge/backend-Python%203.12%2B-3776AB?logo=python&logoColor=white)](backend/)
[![Docker](https://img.shields.io/badge/runtime-Docker-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Kubernetes](https://img.shields.io/badge/orchestration-Kubernetes-326CE5?logo=kubernetes&logoColor=white)](kubernetes/)

> Common Ground Commerce is a full-stack ecommerce platform built by Abdullah Faisal. It runs locally without AWS and includes a production-shaped path through Docker, Kubernetes, monitoring, and GitHub Actions.

Copyright (c) 2026 Abdullah Faisal. Licensed under the [MIT License](LICENSE).

## Contents

- [What this project does](#what-this-project-does)
- [Technology stack](#technology-stack)
- [Run locally](#run-locally)
- [Test and build](#test-and-build)
- [API reference](#api-reference)
- [Kubernetes and monitoring](#kubernetes-and-monitoring)
- [GitHub Actions](#github-actions)
- [Repository map](#repository-map)
- [Email configuration](#email-configuration)
- [Production status](#production-status)
- [License](#license)

## What this project does

The project provides a working ecommerce flow:

1. A customer browses products in the React storefront.
2. The customer filters products and adds items to a shopping bag.
3. The storefront sends the order to the Flask API.
4. The API validates the email, products, and quantities.
5. PostgreSQL stores the order and calculates the total from database prices.
6. Redis queues an order-confirmation task.
7. Celery processes the task in the background.
8. The storefront displays the order number and total.
9. Optional SMTP settings send a real confirmation email.

## Architecture

```text
Browser
	|
	v
React/Vite storefront -> Nginx -> Flask API -> PostgreSQL
																			|
																			v
																Redis -> Celery worker -> optional SMTP

Prometheus <- /metrics
Grafana    <- Prometheus
Loki       <- log storage configuration
```

Docker Compose runs the stack on one computer. Kubernetes runs the same services as a cluster. Terraform describes optional AWS infrastructure. GitHub Actions runs quality checks and publishes container images.

## Technology stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React, Vite, CSS | Storefront, filters, bag, checkout, confirmation |
| Web server | Nginx | Static frontend hosting and `/api` proxy |
| Backend | Python, Flask | API routes and business validation |
| Database | PostgreSQL, SQLAlchemy | Products and orders |
| Background work | Redis, Celery | Queued order confirmation tasks |
| Local runtime | Docker Compose | Reproducible local services |
| Cluster runtime | Kubernetes, Kustomize | Deployments, services, ingress, scaling |
| Monitoring | Prometheus, Grafana, Loki | Metrics, dashboards, alerts, logs |
| Automation | GitHub Actions, GHCR | Tests, builds, and image publishing |
| Cloud option | Terraform, AWS/EKS | Optional infrastructure definition |

## Run locally

### Requirements

- Docker Desktop
- Git
- Python 3.12 or newer for host-side tests
- Node.js 20 or newer for host-side frontend builds

Start the complete local stack:

```bash
cd /c/Users/Candi/Documents/ecommerce-platform
docker compose up -d --build
```

Open the storefront at [http://localhost:3000](http://localhost:3000).

Useful endpoints:

- Storefront: `http://localhost:3000`
- API health: `http://localhost:5000/health`
- Product API: `http://localhost:5000/api/products`
- Metrics: `http://localhost:5000/metrics`

Check services:

```bash
docker compose ps
docker compose logs worker
```

Stop local services:

```bash
docker compose down
```

### Demonstrate checkout

1. Open the storefront.
2. Choose a category or browse all products.
3. Click `+` on a product.
4. Open `Bag`.
5. Enter an email address.
6. Click `Place order`.
7. Confirm the visible order number and total.

The local order completes without SMTP. The worker logs that email is not configured rather than pretending an email was delivered.

## Test and build

Backend:

```bash
python -m pip install -r backend/requirements.txt
python -m pytest backend/tests
```

Frontend:

```bash
cd frontend
npm install
npm run build
cd ..
```

Configuration checks:

```bash
docker compose config --quiet
kubectl kustomize kubernetes/overlays/dev >/dev/null
kubectl kustomize kubernetes/overlays/staging >/dev/null
kubectl kustomize kubernetes/overlays/production >/dev/null
terraform -chdir=terraform validate
```

## API reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `GET` | `/api/products` | List products |
| `GET` | `/api/products/<id>` | Get one product |
| `POST` | `/api/orders` | Validate and create an order |
| `GET` | `/metrics` | Prometheus metrics |

Example order:

```json
{
	"email": "buyer@example.com",
	"items": [{"productId": 1, "quantity": 2}]
}
```

Test it directly:

```bash
curl -X POST http://localhost:5000/api/orders \
	-H "Content-Type: application/json" \
	-d '{"email":"demo@example.com","items":[{"productId":1,"quantity":1}]}'
```

## Kubernetes and monitoring

AWS is not required. Minikube runs the production-shaped stack locally.

```bash
minikube start --driver=docker
docker build -t ecommerce-backend:latest backend
docker build -t ecommerce-frontend:latest frontend
minikube image load ecommerce-backend:latest
minikube image load ecommerce-frontend:latest
kubectl apply -k kubernetes/overlays/dev
kubectl get pods -n ecommerce
```

The namespace includes frontend, backend, PostgreSQL, Redis, Celery, Prometheus, Grafana, and Loki.

Access the Kubernetes storefront:

```bash
kubectl port-forward -n ecommerce service/frontend 3001:80
```

Access monitoring:

```bash
kubectl port-forward -n ecommerce service/prometheus 9090:9090
kubectl port-forward -n ecommerce service/grafana 3002:3000
```

- Storefront: [http://localhost:3001](http://localhost:3001)
- Prometheus: [http://localhost:9090](http://localhost:9090)
- Grafana: [http://localhost:3002](http://localhost:3002)

Remove the Kubernetes application:

```bash
kubectl delete namespace ecommerce
minikube stop
```

## GitHub Actions

The repository is hosted at [github.com/4bdullahfaisal/ecommerce-platform](https://github.com/4bdullahfaisal/ecommerce-platform).

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `ci.yaml` | Push and pull request | Tests backend, builds frontend, validates Compose/Kustomize, builds images |
| `publish-images.yaml` | Push to `main` | Publishes backend and frontend images to GHCR |
| `deploy-dev.yaml` | Manual | Applies the development Kubernetes overlay |
| `deploy-staging.yaml` | Manual or release-candidate tag | Applies staging resources |
| `deploy-prod.yaml` | Manual input | Applies production resources |

CI does not require AWS or paid hosting. Deployment workflows require a real cluster, registry, credentials, secrets, domain, and TLS configuration.

## Repository map

### Frontend

| Path | Purpose |
| --- | --- |
| `frontend/src/App.jsx` | Main UI state, bag, checkout, and confirmation |
| `frontend/src/components/ProductCard.jsx` | Reusable product card |
| `frontend/src/main.jsx` | React entry point |
| `frontend/src/styles.css` | Responsive design |
| `frontend/Dockerfile` | Frontend image |
| `frontend/nginx.conf` | SPA hosting and API proxy |

### Backend

| Path | Purpose |
| --- | --- |
| `backend/app/app.py` | Flask factory and API routes |
| `backend/app/models.py` | Product and Order database models |
| `backend/app/utils.py` | Seed products |
| `backend/app/tasks.py` | Celery and SMTP confirmation task |
| `backend/tests/` | Automated API and model tests |
| `backend/Dockerfile` | Gunicorn image |

### Platform

| Path | Purpose |
| --- | --- |
| `docker-compose.yml` | Local service orchestration |
| `kubernetes/base/` | Shared Kubernetes resources |
| `kubernetes/overlays/` | Environment-specific configuration |
| `terraform/` | Optional AWS infrastructure |
| `monitoring/` | Prometheus, Grafana, and Loki configuration |
| `.github/workflows/` | CI, image publishing, and deployment workflows |
| `WALKTHROUGH.md` | Full step-by-step operating guide |

## Email configuration

Email is optional. Copy the example file:

```bash
cp .env.example .env
```

Set provider details:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

Use an app password, never a normal account password. `.env` is ignored by Git and must never be committed.

## Production status

Completed:

- Working React storefront and checkout flow
- Flask API and PostgreSQL persistence
- Redis/Celery background task
- Optional SMTP delivery
- Docker Compose environment
- Minikube Kubernetes deployment
- Prometheus metrics and Grafana/Loki configuration
- GitHub Actions CI and image publishing
- Terraform configuration validated locally
- MIT licensing and UI copyright attribution

Still required before public production:

- Hosted cluster or production server
- Real domain and TLS certificate
- External secrets manager
- Payment processor
- Production email credentials
- Database backups and recovery plan
- Authentication, authorization, rate limiting, and security review
- Production log collector for Loki

## License

Copyright (c) 2026 Abdullah Faisal. This project is licensed under the [MIT License](LICENSE).

The storefront displays:

```text
© 2026 Abdullah Faisal. All rights reserved.
```

See [LICENSE](LICENSE) for the full license text.
