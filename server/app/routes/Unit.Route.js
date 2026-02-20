import express from 'express';
import {
    createUnit,
    getUnitById,
    deleteUnitById,
    getUnits,
    updateUnitById
} from '../controllers/Unit.Controller.js';
import { userAuth } from '../middleware/Auth.middleware.js';
import rbac from '../middleware/Role.middleware.js';

const router = express.Router();

router.route('/')
    .post(userAuth, rbac("unit:write"), createUnit)
    .get(userAuth, rbac("unit:read"), getUnits);
router.route('/:id')
    .get(userAuth, rbac("unit:read"), getUnitById)
    .put(userAuth, rbac("unit:write"), updateUnitById)
    .delete(userAuth, rbac("unit:delete"), deleteUnitById);

export default router;