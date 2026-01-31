import express from "express";
import {
    createStockMovement,
    getStockMovements
} from "../controllers/StockMovement.Controller.js";
import {userAuth} from "../middleware/userAuth.js";

const router = express.Router();

router.route("/")
    .post(userAuth, createStockMovement)
    .get(userAuth, getStockMovements);

export default router;