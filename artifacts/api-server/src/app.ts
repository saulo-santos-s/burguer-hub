import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve public directory: check dist/public (prod) and artifacts/api-server/public (dev)
let PUBLIC_DIR = path.resolve(__dirname, "public");
if (!import.meta.url.includes("/dist/")) {
  // If not running from dist, look for public in the artifact root
  PUBLIC_DIR = path.resolve(__dirname, "..", "public");
}

// SECURITY: Only log sensitive paths in development
if (process.env.NODE_ENV !== 'production') {
  console.log(`Resolved PUBLIC_DIR: ${PUBLIC_DIR}`);
}

// SECURITY: CORS with strict whitelist
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
if (allowedOrigins.length === 0) {
  allowedOrigins.push("http://localhost:5173", "http://localhost:3000"); // Development defaults
}

// SECURITY: Security headers with comprehensive configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Required for some UI libraries
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"], // For API calls
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// SECURITY: Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// SECURITY: Stricter rate limiting for auth routes is applied in routes/index.ts
app.use(
  pinoHttp({
    logger
  })
);

// SECURITY: CORS with specific origin whitelist
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", router);

// Serve static files from the React app build
app.use(express.static(PUBLIC_DIR));

// Fallback for Client-side routing: serve index.html for any non-API GET request
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
  } else {
    next();
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
