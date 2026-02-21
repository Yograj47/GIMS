import express from 'express';
import { createProductUnit, updateProductUnit, getAllProductUnits,deleteProductUnit } from "../controllers/ProductUnit.Controller.js";
import { userAuth } from "../middleware/Auth.middleware.js"
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();

router.route("/")
    .get(userAuth, getAllProductUnits)
    .post(userAuth, rbac("all"), createProductUnit);
router.route("/:id")
    .put(userAuth, rbac("all"), updateProductUnit)
    .delete(userAuth, rbac("all"), deleteProductUnit); 

export default router;