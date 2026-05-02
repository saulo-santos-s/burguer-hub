import { Router } from "express";
import { ProductModel, CategoryModel } from "@workspace/db";
import {
  CreateProductBody,
  UpdateProductBody,
  ListProductsQueryParams,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const parsed = ListProductsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      console.error("Zod parse failed for /products:", parsed.error.format());
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { type, categoryId, promotion } = parsed.data;
    const query: any = {};

    if (type) query.type = type;
    if (categoryId) query.categoryId = categoryId;
    if (promotion !== undefined) query.promotion = promotion === "true";

    const products = await ProductModel.find(query)
      .populate("categoryId")
      .sort({ name: 1 });

    res.json(products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      categoryId: p.categoryId?._id.toString() || null,
      categoryName: (p.categoryId as any)?.name || null,
      type: p.type,
      quantity: p.quantity,
      promotion: p.promotion,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res): Promise<void> => {
  try {
    const parsed = CreateProductBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const product = await ProductModel.create({
      ...parsed.data,
      categoryId: parsed.data.categoryId || null,
    });

    const populated = await product.populate("categoryId");

    res.status(201).json({
      id: populated._id.toString(),
      name: populated.name,
      description: populated.description,
      price: populated.price,
      imageUrl: populated.imageUrl,
      categoryId: populated.categoryId?._id.toString() || null,
      categoryName: (populated.categoryId as any)?.name || null,
      type: populated.type,
      quantity: populated.quantity,
      promotion: populated.promotion,
      createdAt: populated.createdAt.toISOString(),
      updatedAt: populated.updatedAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    // SECURITY: Validate ObjectId format
    if (!ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ error: "Invalid product ID format" });
      return;
    }

    const product = await ProductModel.findById(req.params.id).populate("categoryId");
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId?._id.toString() || null,
      categoryName: (product.categoryId as any)?.name || null,
      type: product.type,
      quantity: product.quantity,
      promotion: product.promotion,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    // SECURITY: Validate ObjectId format
    if (!ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ error: "Invalid product ID format" });
      return;
    }

    const parsed = UpdateProductBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { ...parsed.data, updatedAt: new Date() },
      { new: true }
    ).populate("categoryId");

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId?._id.toString() || null,
      categoryName: (product.categoryId as any)?.name || null,
      type: product.type,
      quantity: product.quantity,
      promotion: product.promotion,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    // SECURITY: Validate ObjectId format
    if (!ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ error: "Invalid product ID format" });
      return;
    }

    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
