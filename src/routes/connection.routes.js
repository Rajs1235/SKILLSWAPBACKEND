import express from 'express';
import { addConnection, getConnections } from '../controllers/connection.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, addConnection);
router.get('/', verifyJWT, getConnections);
router.delete('/:userId', verifyJWT, removeConnectionController);
export default router;
