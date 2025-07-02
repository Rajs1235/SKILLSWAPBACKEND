// src/routes/matchListing.routes.js
import express from "express";
import { getAllListingsController } from "../user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; // or remove if public

const router = express.Router();

router.get("/", authMiddleware, getAllListingsController);
// or: router.get("/", getAllListingsController);

export default router;
