import { loadHistoricalData } from "../historical-data-loader.js";
import { prisma } from "@trafind/database";
async function main() {
    try {
        const candles = await loadHistoricalData({
            symbol: "SOLUSDT",
            interval: "M1",
            limit: 100
        });
        console.log("Total candles:", candles.length);
        console.log("First candle:", candles[0]);
        console.log("Last candle:", candles[candles.length - 1]);
    }
    finally {
        await prisma.$disconnect();
    }
}
main().catch(console.error);
//# sourceMappingURL=test-historical-loader.js.map