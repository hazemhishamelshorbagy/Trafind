import "dotenv/config";
import { prisma } from "./client.js";

async function main() {
  try {
    await prisma.$connect();

    const result = await prisma.$queryRaw`
      SELECT 1 AS connected
    `;

    console.log("Database connection successful!");
    console.log(result);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();