import express from "express";
import { createProduct, getProducts, updateProduct, getProduct, deleteProduct } from "../controllers/productController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.use(protectRoute); // protect all product routes

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.get("/:id", getProduct);
router.delete("/:id", deleteProduct);

export default router;
