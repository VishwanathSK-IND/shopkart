import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import getRazorpay from "../config/razorpay.js";

const ADDRESS_FIELDS = [
  "fullName",
  "phone",
  "addressLine1",
  "city",
  "state",
  "pincode",
];

const FIELD_LABELS = {
  fullName: "Full name",
  phone: "Phone number",
  addressLine1: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
};

// Same rules as the React form, enforced again because the client can be bypassed.
// Returns { address } on success or { message } describing the first problem.
const validateShippingAddress = (input) => {
  if (!input || typeof input !== "object") {
    return { message: "Shipping address is required" };
  }

  const address = {};

  for (const field of ADDRESS_FIELDS) {
    const value = typeof input[field] === "string" ? input[field].trim() : "";

    // Whitespace-only input is trimmed to "" and rejected here.
    if (!value) {
      return { message: `${FIELD_LABELS[field]} is required` };
    }

    address[field] = value;
  }

  if (!/^[6-9]\d{9}$/.test(address.phone)) {
    return { message: "Phone number must be a valid 10-digit mobile number" };
  }

  if (!/^\d{6}$/.test(address.pincode)) {
    return { message: "Pincode must contain 6 digits" };
  }

  return { address };
};

// Constant-time comparison so the check does not leak how many characters matched.
const signaturesMatch = (expected, received) => {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const serverError = (res) =>
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });

// POST /orders/create-payment-order
// Body: { shippingAddress }. Anything else (items, prices, totalAmount) is ignored:
// the order is built only from the user's saved cart and the latest Product data.
export const createPaymentOrder = async (req, res) => {
  try {
    const { address, message } = validateShippingAddress(
      req.body?.shippingAddress
    );

    if (message) {
      return res.status(400).json({ success: false, message });
    }

    const razorpay = getRazorpay();

    if (!razorpay) {
      console.error("Razorpay keys are missing. Set them in server/.env");
      return res.status(500).json({
        success: false,
        message: "Payments are not configured. Please try again later.",
      });
    }

    // Load the cart fresh from the database with the LATEST product data.
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image stock",
    });

    if (customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const items = [];
    let totalAmount = 0;

    for (const { product, quantity } of customer.cart) {
      // populate() returns null when the product was deleted after being added.
      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "A product in your cart is no longer available. Please remove it and try again.",
        });
      }

      // Stock may have dropped since the item was added to the cart.
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message:
            product.stock === 0
              ? `${product.name} is out of stock.`
              : `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
        });
      }

      // Snapshot of purchase-time data.
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      });

      totalAmount += product.price * quantity;
    }

    // Avoid floating point leftovers such as 7496.999999.
    totalAmount = Math.round(totalAmount * 100) / 100;

    // 1. Save our own order first, waiting for payment. The cart is NOT touched.
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: address,
      totalAmount,
    });

    // 2. Create the matching Razorpay Order. Razorpay expects paise (₹1 = 100).
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order._id.toString(),
        notes: { shopKartOrderId: order._id.toString() },
      });
    } catch (error) {
      console.error("Razorpay order creation failed:", error?.error ?? error);
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(502).json({
        success: false,
        message: "Unable to start payment. Please try again.",
      });
    }

    // 3. Link the two so verification can use OUR stored Razorpay order id.
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Only safe values go to the browser. The Key ID is public; the secret never leaves the server.
    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    return serverError(res);
  }
};

// POST /orders/verify-payment
// Body: { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body ?? {};

    if (
      !mongoose.Types.ObjectId.isValid(shopKartOrderId) ||
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing or invalid",
      });
    }

    // Ownership is part of the query: another user's order is simply "not found".
    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id,
    });

    if (!order || !order.razorpayOrderId) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Already verified (e.g. the request was retried): report success again.
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    // The signature is generated from OUR stored Razorpay order id, never just
    // the one the browser sent, so a payment for a different order cannot be reused.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    if (
      razorpay_order_id !== order.razorpayOrderId ||
      !signaturesMatch(expectedSignature, razorpay_signature)
    ) {
      // Order stays unpaid and the cart is left untouched.
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Atomic: only one request can move this order to PAID, even if the
    // verify call is sent twice at the same moment.
    const paidOrder = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: "PAID" } },
      {
        $set: {
          paymentStatus: "PAID",
          status: "PLACED",
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { returnDocument: "after" }
    );

    if (!paidOrder) {
      const existing = await Order.findById(order._id);
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order: existing,
      });
    }

    // Payment is confirmed: reduce stock for each purchased item. The filter
    // prevents stock going negative if it changed during payment.
    await Product.bulkWrite(
      paidOrder.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product, stock: { $gte: item.quantity } },
          update: { $inc: { stock: -item.quantity } },
        },
      }))
    );

    // Only now, after verified payment, is the cart cleared.
    await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

    return res.status(200).json({
      success: true,
      message: "Payment verified. Order placed successfully.",
      order: paidOrder,
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return serverError(res);
  }
};

// GET /orders — only the logged-in user's orders, newest first.
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return serverError(res);
  }
};

// GET /orders/:id — 404 for both "does not exist" and "belongs to someone else",
// so other users' order ids cannot be discovered by guessing.
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return serverError(res);
  }
};
