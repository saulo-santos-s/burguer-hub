import { defineConfig } from "drizzle-kit";
import path from "path";

// Using SQLite for local development
// For production, switch to PostgreSQL by setting DATABASE_URL env variable
const isProduction = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgresql://");

const config = isProduction
  ? // Production PostgreSQL config
    defineConfig({
      schema: path.join(__dirname, "./src/schema/index.ts"),
      dialect: "postgresql",
      dbCredentials: {
        url: process.env.DATABASE_URL!,
      },
    })
  : // Development SQLite config
    defineConfig({
      schema: path.join(__dirname, "./src/schema/index.ts"),
      dialect: "sqlite",
      dbCredentials: {
        url: "file:./burger_hub.db",
      },
    });

export default config;

