# ---------- build frontend ----------
FROM node:20-alpine AS fe
WORKDIR /client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ---------- build backend ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["src/Supatable.Api/Supatable.Api.csproj", "src/Supatable.Api/"]
RUN dotnet restore "src/Supatable.Api/Supatable.Api.csproj"

COPY . .
WORKDIR "/src/src/Supatable.Api"
RUN dotnet publish "./Supatable.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# ---------- runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish ./
COPY --from=fe /client/dist ./wwwroot

ENTRYPOINT ["dotnet", "Supatable.Api.dll"]
