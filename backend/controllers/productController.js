import { sql } from "../config/db.js";
import { redis } from "../lib/redis.js";

const CACHE_TTL = 60 * 5; // 5 minutes

export const getProducts = async (req, res) => {
  try {
    const cached = await redis.get("products");
    if (cached) {
      return res.status(200).json({ success: true, data: cached, fromCache: true });
    }

    const products = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC
    `;

    await redis.set("products", JSON.stringify(products), { ex: CACHE_TTL });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("Error in getProducts function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, image } = req.body;

  if (!name || !price || !image) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const newProduct = await sql`
      INSERT INTO products (name,price,image)
      VALUES (${name},${price},${image})
      RETURNING *
    `;

    await redis.del("products");

    res.status(201).json({ success: true, data: newProduct[0] });
  } catch (error) {
    console.log("Error in createProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const cached = await redis.get(`product:${id}`);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, fromCache: true });
    }

    const product = await sql`
      SELECT * FROM products WHERE id=${id}
    `;

    if (!product.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await redis.set(`product:${id}`, JSON.stringify(product[0]), { ex: CACHE_TTL });

    res.status(200).json({ success: true, data: product[0] });
  } catch (error) {
    console.log("Error in getProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;

  if (!name || !price || !image) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const updatedProduct = await sql`
      UPDATE products
      SET name=${name}, price=${price}, image=${image}
      WHERE id=${id}
      RETURNING *
    `;

    if (updatedProduct.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await redis.del(`product:${id}`);
    await redis.del("products");

    res.status(200).json({ success: true, data: updatedProduct[0] });
  } catch (error) {
    console.log("Error in updateProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await sql`
      DELETE FROM products WHERE id = ${id} RETURNING *
    `;

    if (!deletedProduct.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await redis.del(`product:${id}`);
    await redis.del("products");

    return res.status(200).json({ success: true, message: "Product deleted successfully", data: deletedProduct[0] });
  } catch (error) {
    console.log("Error in deleteProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
