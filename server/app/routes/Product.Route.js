import express from "express"
import { createProduct, getProducts, getProductById, UpdateProductById, deleteProductById } from "../controllers/Product.Controller.js"

const router = express.Router();

router.route("/").get(getProducts).post(createProduct);
router.route("/:productId").get(getProductById).put(UpdateProductById).delete(deleteProductById);

export default router;