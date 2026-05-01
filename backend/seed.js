import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";

dotenv.config();

const categoriesData = [
  {
    name: "Fashion",
    description: "Trending clothing, footwear and accessories.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Electronics",
    description: "Latest gadgets, audio gear and smart devices.",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Beauty",
    description: "Skincare, fragrances and personal care.",
    image: "https://images.unsplash.com/photo-1522335789203-aaa01dca7c41?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Home & Living",
    description: "Decor, kitchen and everyday home essentials.",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
  },
];

const productsByCategory = {
  Fashion: [
    {
      name: "Classic Leather Sneakers",
      description: "Premium leather upper, cushioned sole, all-day comfort.",
      price: 4299, discountPrice: 3499, brand: "UrbanStep", stock: 42, rating: 4.8, numReviews: 124,
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Cotton Casual Backpack",
      description: "Durable cotton canvas with laptop sleeve and water bottle pockets.",
      price: 1899, discountPrice: 1499, brand: "PackPro", stock: 78, rating: 4.5, numReviews: 86,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Premium Aviator Sunglasses",
      description: "UV400 polarized lenses, lightweight metal frame.",
      price: 2499, discountPrice: 1999, brand: "SunRay", stock: 60, rating: 4.6, numReviews: 92,
      images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Minimalist Analog Watch",
      description: "Stainless steel case, sapphire crystal, 30M water resistant.",
      price: 6599, discountPrice: 5499, brand: "Tempo", stock: 25, rating: 4.7, numReviews: 58,
      images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80"],
    },
  ],
  Electronics: [
    {
      name: "Wireless Noise-Cancelling Headphones",
      description: "Active noise cancellation, 30-hour battery life, hi-res audio.",
      price: 12999, discountPrice: 10499, brand: "Acoustix", stock: 30, rating: 4.9, numReviews: 312,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Smart Fitness Watch",
      description: "Heart-rate, SpO2, GPS, 7-day battery, 50+ workout modes.",
      price: 8499, discountPrice: 6999, brand: "FitPulse", stock: 50, rating: 4.8, numReviews: 198,
      images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Ultra HD Action Camera",
      description: "4K@60fps, waterproof, image stabilization, Wi-Fi enabled.",
      price: 15999, discountPrice: 13499, brand: "Voyager", stock: 18, rating: 4.6, numReviews: 74,
      images: ["https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Mechanical Gaming Keyboard",
      description: "RGB backlit, hot-swappable switches, aluminum frame.",
      price: 5499, discountPrice: 4499, brand: "KeyForge", stock: 65, rating: 4.7, numReviews: 145,
      images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=900&q=80"],
    },
  ],
  Beauty: [
    {
      name: "Hydrating Face Serum",
      description: "Hyaluronic acid + vitamin C for glowing, hydrated skin.",
      price: 1299, discountPrice: 999, brand: "GlowLab", stock: 120, rating: 4.6, numReviews: 220,
      images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Luxury Eau de Parfum",
      description: "Notes of bergamot, jasmine and amber. Long-lasting wear.",
      price: 3999, discountPrice: 3199, brand: "Aroma", stock: 40, rating: 4.7, numReviews: 88,
      images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Matte Lipstick Set",
      description: "5-pack of long-wearing matte shades. Cruelty-free.",
      price: 1499, discountPrice: 1199, brand: "ColorPop", stock: 85, rating: 4.5, numReviews: 132,
      images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80"],
    },
  ],
  "Home & Living": [
    {
      name: "Stainless Steel Insulated Bottle",
      description: "Keeps drinks cold for 24h, hot for 12h. 750ml.",
      price: 999, discountPrice: 749, brand: "AquaPure", stock: 200, rating: 4.5, numReviews: 410,
      images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Scented Soy Candle Set",
      description: "Set of 3 hand-poured candles. Lavender, vanilla, sandalwood.",
      price: 1799, discountPrice: 1399, brand: "Hearth", stock: 75, rating: 4.7, numReviews: 96,
      images: ["https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80"],
    },
    {
      name: "Premium Yoga Mat",
      description: "6mm thick, non-slip, eco-friendly TPE. With carry strap.",
      price: 1499, discountPrice: 1199, brand: "ZenFlex", stock: 90, rating: 4.6, numReviews: 178,
      images: ["https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80"],
    },
  ],
};

const run = async () => {
  try {
    await connectDB();

    console.log("Clearing existing categories and products...");
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log("Seeding categories...");
    const categories = await Category.insertMany(categoriesData);
    const catMap = Object.fromEntries(categories.map((c) => [c.name, c._id]));

    console.log("Seeding products...");
    const productDocs = [];
    for (const [catName, items] of Object.entries(productsByCategory)) {
      for (const item of items) {
        productDocs.push({ ...item, category: catMap[catName] });
      }
    }
    for (const p of productDocs) {
      await Product.create(p); // create one-by-one to trigger pre-validate slug hooks
    }

    console.log(`Seeded ${categories.length} categories and ${productDocs.length} products.`);
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
