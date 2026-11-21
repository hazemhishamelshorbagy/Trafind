/**
 * What: Creates the shared Prisma PostgreSQL client.
 * Why: Supplies a configured database connection and UTC timezone to all package users.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
  options: "-c timezone=UTC"
});
export const prisma = new PrismaClient({
  adapter
});