# Supatable

Supatable is a full-stack demo project that implements a read-only data table (Prisma-like UI)
on top of a modern backend and frontend stack.

The project is organized as a monorepo and is intended as a technical showcase.

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
