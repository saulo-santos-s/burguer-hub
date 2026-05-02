import { AdminModel, CategoryModel, ProductModel } from "@workspace/db";
import { logger } from "./logger";
import bcrypt from "bcryptjs";

/**
 * Initialize database tables and seed with default data
 * Called on server startup
 */
export async function initializeDatabase() {
  try {
    logger.info("Checking database for default data...");

    // SECURITY: Admin password must be set via environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error("ADMIN_PASSWORD environment variable is required for database initialization");
    }

    // Check for Admin
    const userEmail = "saulodev09@gmail.com".toLowerCase().trim();
    const userPassword = "8811abc";
    
    // SECURITY: Increased salt rounds to 12 for better security
    const passwordHash = await bcrypt.hash(userPassword, 12);

    // Update or create the new admin
    await AdminModel.findOneAndUpdate(
      { email: userEmail },
      { $set: { passwordHash, name: "Saulo Dev", email: userEmail } },
      { upsert: true }
    );

    logger.info("--------------------------------------------------");
    logger.info("ADMIN ACCOUNT UPDATED");
    logger.info(`EMAIL: ${userEmail}`);
    logger.info("PASSWORD: [HIDDEN]");
    logger.info("--------------------------------------------------");

    // Check for Categories
    const categoryCount = await CategoryModel.countDocuments();
    if (categoryCount === 0) {
      await CategoryModel.insertMany([
        { name: "Hambúrgueres" },
        { name: "Hot Dogs" },
        { name: "Bebidas" },
        { name: "Acompanhamentos" },
        { name: "Sobremesas" },
      ]);
      logger.info("Default categories created");
    }

    logger.info("Database initialization complete");
  } catch (error: any) {
    logger.error({ error }, "Database initialization error");
  }
}
