import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
