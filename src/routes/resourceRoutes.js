import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import {
  createResource,
  getAllResources,
  getResourceById,
  deleteResource,
} from "../controllers/resourceController.js";

const router = express.Router();

router.get("/", getAllResources);
router.get("/:id", getResourceById);

// Admin only
router.post("/", authenticate, createResource);
router.delete("/:id", authenticate, deleteResource);

export default router;
