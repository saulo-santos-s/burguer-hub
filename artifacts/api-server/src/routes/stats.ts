import { Router } from "express";
import { ProductModel, CategoryModel } from "@workspace/db";

const router = Router();

router.get("/dashboard", async (_req, res): Promise<void> => {
  try {
    const [products, totalCategories] = await Promise.all([
      ProductModel.find(),
      CategoryModel.countDocuments(),
    ]);

    const totalProducts = products.length;
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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
