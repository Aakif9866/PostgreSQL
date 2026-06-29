import express from "express";
import { createProduct, getProducts,updateProduct,getProduct,deleteProduct } from "../controllers/productController.js";

// CRUD operations

const router = express.Router();

router.get("/",getProducts)

router.post("/",createProduct)

router.put("/:id",updateProduct)

router.get("/:id",getProduct)

router.delete("/:id",deleteProduct)

export default router;

