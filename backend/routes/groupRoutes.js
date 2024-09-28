import express from 'express';
import { createGroup,getAllGroups,deleteGroup } from '../controllers/groupController.js';

const router = express.Router();

router.post('/create', createGroup);
router.delete('/:id', deleteGroup);
router.get('/', getAllGroups);

export default router;
