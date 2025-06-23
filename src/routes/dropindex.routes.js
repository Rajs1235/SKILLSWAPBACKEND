import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.delete("/drop-knownskills-index", async (req, res) => {
  try {
    await mongoose.connection.db.collection("knownskills").dropIndex("username_1");
    res.status(200).json({ success: true, message: "knownskills index dropped" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.delete("/drop-targetskills-index", async (req, res) => {
  try {
    await mongoose.connection.db.collection("targetskills").dropIndex("username_1");
    res.status(200).json({ success: true, message: "targetskills index dropped" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
