import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { authorizeRoles } from "../middleware/rolemiddleware.js";
import { createResource } from "../controllers/resourceController.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("admin"), createResource);

export default router;
