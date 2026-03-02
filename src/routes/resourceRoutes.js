import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import {
  createResource,
  getAllResources,
  getResourceById,
} from "../controllers/resourceController.js";

const router = express.Router();

router.get("/", getAllResources);
router.get("/:id", getResourceById);

// Admin only
router.post("/", authenticate, createResource);

export default router;
