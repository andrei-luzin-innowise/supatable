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
