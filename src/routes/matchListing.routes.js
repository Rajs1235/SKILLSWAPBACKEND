// src/routes/matchListing.routes.js
import express from "express";
import { getAllListingsController, createMatchListingController } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all match listings
router.get("/", verifyJWT, getAllListingsController);

// ✅ Add this POST route to support new listing creation
router.post("/", verifyJWT, createMatchListingController);

export default router;
