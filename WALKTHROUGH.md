# Common Ground Commerce Walkthrough

This walkthrough takes you from a fresh checkout of the repository to a working ecommerce demonstration. It uses local Docker and Minikube, so AWS is not required.

## 1. Prerequisites

Install:

- Docker Desktop
- Git
- Python 3.12 or newer
- Node.js 20 or newer
- Minikube and `kubectl` for the Kubernetes section

Clone the project and enter it:

```bash
git clone https://github.com/4bdullahfaisal/ecommerce-platform.git
cd ecommerce-platform
```

## 2. Start the local application

Docker Compose runs the complete application:

```bash
docker compose up -d --build
```

Check the containers:

```bash
docker compose ps
```

You should see:

- `frontend`
- `backend`
- `postgres`
- `redis`
- `worker`

Open the storefront at [http://localhost:3000](http://localhost:3000).

## 3. Demonstrate the storefront

1. Browse the product catalogue.
2. Select a category filter.
3. Add a product using the `+` button.
4. Open **Bag**.
5. Review the item and total.
6. Enter an email address.
7. Click **Place order**.
8. Confirm that the storefront displays the order number and total.

The order is saved by the Flask API. Redis queues the confirmation task and Celery processes it in the worker.

Without SMTP configuration, the application displays the in-app confirmation and logs that email delivery is not configured. The order still completes successfully.

## 4. Verify the API

Health check:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{"status":"ok"}
```

Product catalogue:

```bash
curl http://localhost:5000/api/products
```

Create a test order:

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","items":[{"productId":1,"quantity":1}]}'
```

Inspect background processing:

```bash
docker compose logs worker
```

## 5. Run automated checks

Backend tests:

```bash
python -m pip install -r backend/requirements.txt
python -m pytest backend/tests
```

Frontend production build:

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

## 6. Optional real email

Copy the example environment file:

```bash
cp .env.example .env
```

Set SMTP values in `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

Use an app password or provider-specific SMTP credential. Do not use or commit your normal email password. Restart the services:

```bash
docker compose up -d --build
```

Place another order and inspect the worker logs if delivery fails:

```bash
docker compose logs worker
```

## 7. Run the application in Kubernetes

Build the local images:

```bash
docker build -t ecommerce-backend:latest backend
docker build -t ecommerce-frontend:latest frontend
```

Start Minikube:

```bash
minikube start --driver=docker
```

Load the images into the Minikube node:

```bash
minikube image load ecommerce-backend:latest
minikube image load ecommerce-frontend:latest
```

Deploy the development overlay:

```bash
kubectl apply -k kubernetes/overlays/dev
```

Inspect the namespace:

```bash
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
```

Wait for all deployments:

```bash
kubectl rollout status deployment/backend -n ecommerce
kubectl rollout status deployment/frontend -n ecommerce
kubectl rollout status deployment/postgres -n ecommerce
kubectl rollout status deployment/redis -n ecommerce
kubectl rollout status deployment/worker -n ecommerce
```

Open the Kubernetes storefront in another terminal:

```bash
kubectl port-forward -n ecommerce service/frontend 3001:80
```

Visit [http://localhost:3001](http://localhost:3001).

## 8. View monitoring

Prometheus metrics from the backend:

```bash
kubectl port-forward -n ecommerce service/backend 5001:5000
```

Open [http://localhost:5001/metrics](http://localhost:5001/metrics).

Prometheus dashboard:

```bash
kubectl port-forward -n ecommerce service/prometheus 9090:9090
```

Open [http://localhost:9090](http://localhost:9090).

Grafana:

```bash
kubectl port-forward -n ecommerce service/grafana 3002:3000
```

Open [http://localhost:3002](http://localhost:3002). Grafana is configured with Prometheus as its default datasource.

Loki is deployed as the log storage component. A log collector such as Promtail or Grafana Alloy would be added for full log shipping in a production environment.

## 9. GitHub Actions walkthrough

Push a change to GitHub:

```bash
git add .
git commit -m "Describe the change"
git push origin main
```

Open the repository's **Actions** tab. The workflows perform these jobs:

1. `CI` installs dependencies and runs backend tests.
2. `CI` builds the frontend.
3. `CI` validates Docker Compose and Kubernetes manifests.
4. `CI` builds both container images.
5. `Publish Images` publishes tagged images to GitHub Container Registry.
6. Deployment workflows remain manual until a Kubernetes cluster and credentials are configured.

## 10. Stop and clean up

Stop the local Docker services:

```bash
docker compose down
```

Delete the Kubernetes application:

```bash
kubectl delete namespace ecommerce
```

Stop Minikube:

```bash
minikube stop
```

To remove the Minikube cluster completely:

```bash
minikube delete
```

## 11. How to explain the project

Use this summary in a presentation:

> The React frontend provides the shopping experience. Flask owns the API and business rules. PostgreSQL stores products and orders. Redis and Celery handle background confirmation work. Docker Compose provides a reproducible local environment. Kubernetes manages the same services as a deployable cluster. Prometheus and Grafana provide observability. GitHub Actions verifies every change and publishes container images. AWS and Terraform are optional infrastructure for a later production deployment.

## 12. What is still needed for real production

Before public production use, add:

- A hosted Kubernetes cluster or another production host
- Real domain and TLS certificate
- External secret manager
- Production PostgreSQL backup and recovery plan
- Payment provider integration
- Production SMTP provider
- Authentication and authorization
- Rate limiting and stronger security headers
- Centralized log collection for Loki
- A real image registry and deployment secrets
