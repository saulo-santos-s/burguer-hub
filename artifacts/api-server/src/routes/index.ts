import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import statsRouter from "./stats";

const router: IRouter = Router();

// SECURITY: Stricter rate limiting for sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Aumentado para testes
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// SECURITY: Rate limiting for data-modifying operations
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit write operations
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.use("/auth", authLimiter, authRouter);
router.use("/health", healthRouter);
router.get("/test", (req, res) => res.json({ message: "API is working" }));
router.use("/categories", writeLimiter, categoriesRouter);
router.use("/products", writeLimiter, productsRouter);
router.use("/stats", statsRouter);

// Log unmatched API routes
router.use((req, res) => {
  console.warn(`Unmatched API route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

export default router;
