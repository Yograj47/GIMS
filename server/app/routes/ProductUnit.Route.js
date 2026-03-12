import express from 'express';
import { createProductUnit, updateProductUnit, getAllProductUnits, deleteProductUnit } from "../controllers/ProductUnit.Controller.js";
import { userAuth } from "../middleware/Auth.middleware.js"
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();

router.use(userAuth, rbac("all"));

router.route("/")
    .get(getAllProductUnits)
    .post(createProductUnit);
router.route("/:id")
    .put(updateProductUnit)
    .delete(deleteProductUnit);

export default router;