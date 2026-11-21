// What: Configures Prisma schema location and PostgreSQL connection for CLI operations.
// Why: Keeps migrations and client generation consistent across database scripts.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations"
  },

  datasource: {
    url: env("DATABASE_URL")
  }
});