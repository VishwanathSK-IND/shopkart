import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

const products = [
  {
    name: "Classic Leather Sneakers",
    description: "Comfortable everyday sneakers crafted from premium leather.",
    price: 2499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    category: "Footwear",
    stock: 40,
  },
  {
    name: "Wireless Over-Ear Headphones",
    description: "Noise-cancelling headphones with 30-hour battery life.",
    price: 3999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 60,
  },
  {
    name: "Minimalist Analog Watch",
    description: "A sleek stainless-steel watch for everyday wear.",
    price: 1899,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&h=500&fit=crop",
    category: "Accessories",
    stock: 75,
  },
  {
    name: "Everyday Canvas Backpack",
    description: "Durable, water-resistant backpack with laptop sleeve.",
    price: 1599,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    category: "Bags",
    stock: 50,
  },
  {
    name: "Ceramic Pour-Over Coffee Set",
    description: "Hand-glazed ceramic dripper and mug set for home brewing.",
    price: 1299,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop",
    category: "Home",
    stock: 30,
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "Compact speaker with rich bass and 12-hour playtime.",
    price: 2199,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 45,
  },
  {
    name: "Cotton Crew T-Shirt",
    description: "Soft, breathable 100% cotton t-shirt for everyday wear.",
    price: 599,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    category: "Apparel",
    stock: 100,
  },
  {
    name: "Mechanical Gaming Keyboard",
    description: "RGB backlit mechanical keyboard with tactile switches.",
    price: 4499,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 35,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log(`Seeded ${products.length} products`);
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();
