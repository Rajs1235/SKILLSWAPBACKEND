// src/routes/matchListing.routes.js
import express from "express";
import { getAllListingsController } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"; // or remove if public

const router = express.Router();

router.get("/", verifyJWT, getAllListingsController);
// or: router.get("/", getAllListingsController);

export default router;
