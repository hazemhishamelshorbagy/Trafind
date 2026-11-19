import { env } from "./config/env.js";
import app from "./app.js";
const server = app.listen(env.PORT, () => {
    console.log(`Trafind API running on port ${env.PORT}`);
});
//# sourceMappingURL=index.js.map