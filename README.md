<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# AnyList - GraphQL API with NestJS

Backend API built with **NestJS** and **GraphQL (code-first)** as part of learning the integration between both technologies. The project implements an items CRUD with operations exposed via GraphQL queries and mutations.

---

## Technologies

| Technology    | Version |
| ------------- | ------- |
| NestJS        | ^11     |
| Apollo Server | ^5      |
| GraphQL       | ^16     |
| TypeScript    | ^5.7    |
| Node.js       | ^22     |

---

## Running in development

### 1. Environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

### 2. Database with Docker

The project includes a `docker-compose.yml` with a **PostgreSQL 17.9** image. Start the container with:

```bash
docker compose up -d
```

This creates the `anylist_db` container on port `5432` and persists data in the `nest_anylist_postgres_db_data` volume.

To stop the container:

```bash
docker compose down
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run migrations

Execute the pending migrations to create the database tables:

```bash
npm run migration:run
```

### 5. Start the application

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/graphql`. The project uses **Apollo Sandbox** to explore the schema and interact with the API.

### 6. Seed the database (optional)

With the app running, execute the seed mutation from the playground:

```graphql
mutation {
  executeSeed
}
```

> **Note:** The seed is blocked in production (`STAGE=prod`).

---

## Available scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run start:dev`  | Start in development mode (watch)  |
| `npm run build`      | Compile the project                |
| `npm run start:prod` | Start the compiled version         |
| `npm run lint`       | Run ESLint                         |
| `npm run test`       | Run tests                          |
| `npm run test:cov`   | Run tests with coverage            |
