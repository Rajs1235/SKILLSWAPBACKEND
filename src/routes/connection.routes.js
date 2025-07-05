import express from 'express';
import { createConnection, getConnections } from '../controllers/connection.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, createConnection);
router.get('/', verifyJWT, getConnections);

export default router;
