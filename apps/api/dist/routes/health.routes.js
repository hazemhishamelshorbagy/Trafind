/**
 * What: Defines the API health-check route.
 * Why: Gives monitoring tools a simple endpoint for API liveness.
 */
import { Router } from "express";
const router = Router();
router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Trafind API is running",
        timestamp: new Date().toISOString()
    });
});
export default router;
//# sourceMappingURL=health.routes.js.map