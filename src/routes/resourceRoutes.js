import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { authorizeRoles } from "../middleware/rolemiddleware.js";
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
router.post("/", authenticate, authorizeRoles("admin"), createResource);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteResource);

export default router;
