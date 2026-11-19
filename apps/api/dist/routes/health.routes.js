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