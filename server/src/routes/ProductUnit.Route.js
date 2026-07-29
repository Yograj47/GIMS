import express from 'express';
import { 
    createProductUnit, 
    updateProductUnit, 
    getAllProductUnits, 
    deleteProductUnit 
} from "../controllers/ProductUnit.Controller.js";
import { userAuth } from "../middleware/Auth.middleware.js"
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();

router.use(userAuth);

router.route("/")
    .get(rbac("productUnit:read"), getAllProductUnits) 
    .post(rbac("productUnit:write"), createProductUnit); 

router.route("/:id")
    .put(rbac("productUnit:write"), updateProductUnit)   
    .delete(rbac("productUnit:delete"), deleteProductUnit); 

export default router;