import { Router } from "express";
import { CategoryModel } from "@workspace/db";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  UpdateCategoryParams,
  DeleteCategoryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  try {
    const categories = await CategoryModel.find().sort({ name: 1 });
    res.json(categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      createdAt: c.createdAt.toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res): Promise<void> => {
  try {
    // SECURITY: Validate ObjectId format
    if (!ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ error: "Invalid category ID format" });
      return;
    }

    const params = UpdateCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const cat = await CategoryModel.findById(params.data.id);
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({
      id: cat._id.toString(),
      name: cat.name,
      createdAt: cat.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "CastError") {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res): Promise<void> => {
  try {
    const parsed = CreateCategoryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const cat = await CategoryModel.create({ name: parsed.data.name });
    res.status(201).json({ 
      id: cat._id.toString(), 
      name: cat.name, 
      createdAt: cat.createdAt.toISOString() 
    });
  } catch (error) {
    if (error instanceof Error && (error as any).code === 11000) {
      res.status(400).json({ error: "Category already exists" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    // SECURITY: Validate ObjectId format
    if (!ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ error: "Invalid category ID format" });
      return;
    }

    const params = UpdateCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const body = UpdateCategoryBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const cat = await CategoryModel.findByIdAndUpdate(
      params.data.id,
      { name: body.data.name },
      { new: true }
    );

    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({ 
      id: cat._id.toString(), 
      name: cat.name, 
      createdAt: cat.createdAt.toISOString() 
    });
  } catch (error) {
    if (error instanceof Error && error.name === "CastError") {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    // SECURITY: Validate ObjectId format
    if (!ObjectId.isValid(req.params.id as string)) {
      res.status(400).json({ error: "Invalid category ID format" });
      return;
    }

    const params = DeleteCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const cat = await CategoryModel.findByIdAndDelete(params.data.id);

    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error && error.name === "CastError") {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
