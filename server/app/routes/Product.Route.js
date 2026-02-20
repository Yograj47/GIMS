import express from "express"
import { createProduct, getProducts, getProductById, UpdateProductById, deleteProductById } from "../controllers/Product.Controller.js"
import { userAuth } from "../middleware/Auth.middleware.js";
import rbac from "../middleware/Role.middleware.js";
const router = express.Router();

router.route("/")
    .get(userAuth, rbac("product:read"), getProducts)
    .post(userAuth, rbac("product:write"), createProduct);
router.route("/:productId")
    .get(userAuth, rbac("product:read"), getProductById)
    .put(userAuth, rbac("product:write"), UpdateProductById)
    .delete(userAuth, rbac("product:delete"), deleteProductById);

export default router;