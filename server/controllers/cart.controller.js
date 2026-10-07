import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const CART_PRODUCT_FIELDS = "name price category image stock";

// Loads the user's cart with each Product populated. Items whose Product was
// deleted come back with product = null, so they are filtered out.
const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: CART_PRODUCT_FIELDS,
  });

  return customer.cart.filter((item) => item.product !== null);
};

const invalidIdResponse = (res) =>
  res.status(400).json({
    success: false,
    message: "Invalid product ID",
  });

const productNotFoundResponse = (res) =>
  res.status(404).json({
    success: false,
    message: "Product not found",
  });

const stockLimitResponse = (res, stock) =>
  res.status(400).json({
    success: false,
    message:
      stock === 0
        ? "Product is out of stock"
        : `Only ${stock} ${stock === 1 ? "unit" : "units"} in stock`,
  });

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return invalidIdResponse(res);
    }

    const product = await Product.findById(productId).select("stock");

    if (!product) {
      return productNotFoundResponse(res);
    }

    // Case 1: product already in cart -> increase its quantity by 1, but only
    // while the current quantity is below stock. Check + update are one atomic
    // operation, so fast double-clicks can't push quantity past stock.
    const incremented = await Customer.updateOne(
      {
        _id: req.user._id,
        cart: {
          $elemMatch: { product: productId, quantity: { $lt: product.stock } },
        },
      },
      { $inc: { "cart.$.quantity": 1 } }
    );

    if (incremented.modifiedCount === 0) {
      // Case 2: product not in cart yet -> add one row with quantity 1.
      // The filter guarantees we never create a duplicate row for the same product.
      const added =
        product.stock >= 1
          ? await Customer.updateOne(
              { _id: req.user._id, "cart.product": { $ne: productId } },
              { $push: { cart: { product: productId, quantity: 1 } } }
            )
          : { modifiedCount: 0 };

      // Neither update matched: either it is out of stock, or the cart
      // already holds every available unit.
      if (added.modifiedCount === 0) {
        return stockLimitResponse(res, product.stock);
      }
    }

    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body ?? {};

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return invalidIdResponse(res);
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId).select("stock");

    if (!product) {
      return productNotFoundResponse(res);
    }

    // Always validated against the latest stock in the Product collection.
    if (quantity > product.stock) {
      return stockLimitResponse(res, product.stock);
    }

    // Only matches if this product is already in the user's cart.
    const result = await Customer.updateOne(
      { _id: req.user._id, "cart.product": productId },
      { $set: { "cart.$.quantity": quantity } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return invalidIdResponse(res);
    }

    // Only matches if the product IS in this user's cart. No Product lookup is
    // needed, so an item whose Product was deleted can still be removed.
    const result = await Customer.updateOne(
      { _id: req.user._id, "cart.product": productId },
      { $pull: { cart: { product: productId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
