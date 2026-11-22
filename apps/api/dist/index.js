/**
 * What: Starts the Express API process on the configured port.
 * Why: Provides the runtime entry point used by development and production scripts.
 */
import { env } from "./config/env.js";
import app from "./app.js";
const server = app.listen(env.PORT, () => {
    console.log(`Trafind API running on port ${env.PORT}`);
});
//# sourceMappingURL=index.js.map