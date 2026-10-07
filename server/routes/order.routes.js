import express from "express";
import {
  createPaymentOrder,
  getOrderById,
  getOrders,
  verifyPayment,
} from "../controllers/order.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Every order route is protected; the user always comes from the token.
router.use(authMiddleware);

router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getOrders);
router.get("/:id", getOrderById);

export default router;
