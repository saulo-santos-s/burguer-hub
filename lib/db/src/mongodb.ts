import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const CategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: null },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  type: { type: String, enum: ["food", "drink"], default: "food" },
  quantity: { type: Number, default: 0 },
  promotion: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AdminModel = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
