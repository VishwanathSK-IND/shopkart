import express from "express";
import {
  createProduct,
  getProductById,
  getProducts,
} from "../controllers/product.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getProducts);
router.get("/:id", authMiddleware, getProductById);
router.post("/", createProduct);

export default router;
