import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, lte, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/dashboard", async (_req, res): Promise<void> => {
  const [products, categories] = await Promise.all([
    db.select().from(productsTable),
    db.select().from(categoriesTable),
  ]);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const promotionProducts = products.filter((p) => p.promotion).length;
  const outOfStockProducts = products.filter((p) => p.quantity <= 0).length;
  const foodCount = products.filter((p) => p.type === "food").length;
  const drinkCount = products.filter((p) => p.type === "drink").length;

  res.json({
    totalProducts,
    totalCategories,
    promotionProducts,
    outOfStockProducts,
    foodCount,
    drinkCount,
  });
});

export default router;
