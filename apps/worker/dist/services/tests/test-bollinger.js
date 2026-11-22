import { calculateBollingerBands } from "../../quantative/bollinger-bands.js";
const closes = [
    100, 102, 101, 103, 105,
    104, 106, 108, 107, 109,
    110, 108, 111, 112, 110,
    113, 115, 114, 116, 118, 120
];
const result = calculateBollingerBands(closes);
console.log(result);
//# sourceMappingURL=test-bollinger.js.map