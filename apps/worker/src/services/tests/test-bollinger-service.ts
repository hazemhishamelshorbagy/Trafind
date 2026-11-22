import { getBollingerBands } from "../bollinger-bands.service.js";
import { prisma } from "@trafind/database";

async function main() {
  try {
    const result = await getBollingerBands({
      symbol: "SOLUSDT",
      interval: "M1",
      period: 20,
      multiplier: 2
    });

    console.log("Bollinger Bands:", result);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);