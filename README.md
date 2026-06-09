# AppFinancas

Full-stack personal finance app with transaction tracking, categories, payment methods and JWT authentication.

## Structure

This monorepo contains the backend. The mobile app lives in a separate repository.

- [`backend/`](./backend) — REST API built with Node.js, Express, Prisma v7 and MariaDB
- [AppFinancas Mobile](https://github.com/MARCELOASSIS87/AppFinancas-mobile) — React Native app built with Expo

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express |
| ORM | Prisma v7 |
| Database | MariaDB (Docker) |
| Auth | JWT |
| Mobile | React Native + Expo |

## Notable Technical Decisions

- **Prisma v7**: datasource URL moved to `prisma.config.ts` — breaking change from v6
- **MariaDB adapter**: requires direct config object instantiation, not an external pool
- **Docker**: database runs in a container on a remote server (port 3307)
- **Monorepo**: backend and mobile in separate repos due to different dev environments (WSL vs Windows)

## Author

Marcelo Assis — [GitHub](https://github.com/MARCELOASSIS87)
