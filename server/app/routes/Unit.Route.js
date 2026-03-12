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
router.use(userAuth);

router.route('/')
    .post(rbac("unit:write"), createUnit)
    .get(rbac("unit:read"), getUnits);
router.route('/:id')
    .get(rbac("unit:read"), getUnitById)
    .put(rbac("unit:write"), updateUnitById)
    .delete(rbac("unit:delete"), deleteUnitById);

export default router;