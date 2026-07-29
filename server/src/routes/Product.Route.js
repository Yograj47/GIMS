import express from "express"
import { createProduct, getProducts, getProductById, UpdateProductById, deleteProductById } from "../controllers/Product.Controller.js"
import { userAuth } from "../middleware/Auth.middleware.js";
import rbac from "../middleware/Role.middleware.js";
const router = express.Router();

router.use(userAuth);

router.route("/")
    .get(rbac("product:read"), getProducts)
    .post(rbac("product:write"), createProduct);
router.route("/:productId")
    .get(rbac("product:read"), getProductById)
    .put(rbac("product:write"), UpdateProductById)
    .delete(rbac("product:delete"), deleteProductById);

export default router;