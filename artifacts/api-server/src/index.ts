import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try to load .env from root directory or current directory
const envPaths = [
  path.resolve(__dirname, "../../../.env"), // prod: artifacts/api-server/dist -> root
  path.resolve(__dirname, "../../.env"),    // dev: artifacts/api-server/src -> root
  path.resolve(process.cwd(), ".env"),      // current working directory
  path.resolve(process.cwd(), "../../.env"), // relative to artifact root
];

// SECURITY: Only log file paths in development
for (const envPath of envPaths) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Attempting to load .env from: ${envPath}`);
  }
  dotenv.config({ path: envPath });
}

if (process.env.DATABASE_URL) {
  if (process.env.NODE_ENV !== 'production') {
    console.log("DATABASE_URL loaded successfully from .env");
  }
} else {
  console.log("DATABASE_URL not found in process.env after loading .env files");
}

// Dynamic imports to ensure dotenv is loaded first
const { default: app } = await import("./app");
const { logger } = await import("./lib/logger");
const { connectDB } = await import("@workspace/db");
const { initializeDatabase } = await import("./lib/db-init");

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);

// Connect to MongoDB and Initialize
const start = async () => {
  try {
    await connectDB();
    await initializeDatabase();
  } catch (err) {
    logger.error({ err }, "Initial database setup failed, but server will try to start");
  }

  app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Server listening");
    logger.info("API and Website available at http://localhost:" + port);
  });
};

start();
