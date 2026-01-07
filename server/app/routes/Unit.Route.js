import express from 'express';
import {
    createUnit,
    getUnitById,
    deleteUnitById,
    getUnits,
    updateUnitById
} from '../controllers/Unit.Controller.js';
import { userAuth } from '../middleware/userAuth.js';

const router = express.Router();

// Note: Route with middleware - Protected routes (Only logged in users can modify)
router.route('/')
    .post(userAuth, createUnit)
    .get(getUnits);
router.route('/:id')
    .get(userAuth, getUnitById)
    .put(userAuth, updateUnitById)
    .delete(userAuth, deleteUnitById);

export default router;