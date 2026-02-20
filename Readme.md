# Supatable

Supatable is a full-stack demo project that implements a read-only data table (Prisma-like UI)
on top of a modern backend and frontend stack.

The project is organized as a monorepo and is intended as a technical showcase.

## Run Locally (Docker Compose)

### Start

```bash
docker compose up
```

### What happens on first run

- Builds API image
- Builds Client image
- Starts PostgreSQL
- Applies EF Core migrations automatically
- Seeds initial data
- Starts Loki
- Starts Prometheus
- Starts Grafana
- Starts API
- Starts Vite client

---

## Runtime Modes

### 1. Demo Mode (from repo)

Use Docker Compose when you want everything in containers:

```bash
docker compose up
```

What runs:

- Backend (`api`) in its own container
- Frontend (`client`) in its own container
- PostgreSQL
- Loki / Prometheus / Grafana

### 2. Development Mode (Rider / local debug)

Run backend and frontend directly from IDE/terminal, keep infra in containers.

Example infra-only start:

```bash
docker compose up db loki prometheus grafana
```

Then:

- Run `Supatable.Api` locally from Rider (debug mode)
- Run frontend locally (`npm run dev` in `client`)

### 3. Azure Tag Deploy Mode

Tag-based GitHub Actions deploy:

- `demo-*` -> ephemeral Azure environment (deploy)
- `v*` -> build/test/artifacts only (no Azure deploy)

For Azure deploy image build, workflow uses:

- `src/Supatable.Api/Dockerfile.azure` (frontend is built and copied into backend `wwwroot`)

Local/demo compose mode still uses:

- `src/Supatable.Api/Dockerfile` (backend-only image)
- `client/Dockerfile` (separate frontend container)

---

## Azure Ephemeral Environment

### Deploy

Push a tag like:

```bash
git tag demo-1
git push origin demo-1
```

`deploy-tag.yaml` will create/use:

- Resource Group: `supatable-ephemeral-<tag>`
- App Service: `supatable-ephemeral-<tag>-api`
- Azure Database for PostgreSQL Flexible Server in the same RG
- Azure Key Vault in the same RG (DB connection string is stored as secret)
- Azure Log Analytics Workspace in the same RG
- Azure Application Insights in the same RG

### Destroy (full cleanup)

Run GitHub Action:

- `Destroy Azure Ephemeral Environment` (`.github/workflows/azure-destroy.yaml`)

Use:

- `deployment_tag=demo-1`
- `confirm=DELETE`

This removes the whole Resource Group, including App Service, managed PostgreSQL and data.

### Azure Observability (instead of local LPG stack)

For `demo-*` Azure deploys:

- App Service app setting `APPLICATIONINSIGHTS_CONNECTION_STRING` is configured automatically
- App Service diagnostic settings are connected to Log Analytics (`allLogs` + `AllMetrics`)

Where to view:

- `Application Insights` -> `Live Metrics`, `Failures`, `Performance`
- `Application Insights` -> `Logs` (KQL)
- `Log Analytics Workspace` -> `Logs` (KQL)
- `App Service` -> `Log stream` (real-time stream)

### Required GitHub Secrets (Azure workflows)

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `GHCR_TOKEN`
- `AZURE_PG_ADMIN_USER` (for `demo-*`)
- `AZURE_PG_ADMIN_PASSWORD` (for `demo-*`)

Optional:

- `AZURE_LOCATION` (default: `westeurope`)
- `AZURE_APP_SERVICE_PLAN_SKU` (default: `B1`)
- `AZURE_PG_SKU` (default: `Standard_B1ms`)
- `AZURE_PG_TIER` (default: `Burstable`)
- `GHCR_USERNAME` (default: repository owner)

---

## Available Endpoints

| Service     | URL                           | Description                 |
|-------------|------------------------------|------------------------------|
| Frontend    | http://localhost:5173        | Vite dev server              |
| GraphQL API | http://localhost:8080/graphql| HotChocolate endpoint        |
| Prometheus  | http://localhost:9090        | Metrics                      |
| Grafana     | http://localhost:3000        | Dashboards (logs + metrics)  |

## Grafana Login

- URL: http://localhost:3000
- Username: `admin`
- Password: `admin`

---
## Database

**Inside docker network**

- Host: `db`
- Port: `5432`
- Database: `supatable`
- Username: `supatable`
- Password: `supatable`

**From host machine**

- Host: `localhost`
- Port: `5432`
- Database: `supatable`
- Username: `supatable`
- Password: `supatable`

## Seed Data

Migrations and seed are applied automatically when running docker compose up.

Initial dataset contains example users with roles:

- Admin
- Manager
- User

---

## Backend stack

- .NET 10
- ASP.NET Core
- GraphQL (HotChocolate)
- CQRS / MediatR
- PostgreSQL
- Entity Framework Core
- Dapper
- Serilog (structured logging)
- OpenTelemetry (metrics)
- Prometheus exporter

### Backend testing

- xUnit
- FluentAssertions
- Moq

---

## Frontend stack

- React
- TypeScript
- Vite
- Tailwind CSS
- GraphQL (HTTP / fetch)

### Frontend testing

- Vitest
- @testing-library/react
- @testing-library/jest-dom
- MSW

---

## Observability

- Serilog (console, file, Loki)
- OpenTelemetry Metrics
- Prometheus
- Grafana
- Loki

---

## Infrastructure / DevOps

- Docker
- Docker Compose
- GitHub Actions (tag-based build)
- Azure App Service
- Azure Key Vault
- PostgreSQL Flexible Server
