import express from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { authorizeRoles } from "../middleware/rolemiddleware.js";
import { updateUserRole } from "../controllers/adminController.js";

const router = express.Router();

// test only route

router.get("/admin-only", authenticate, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.put(
  "/users/role",
  authenticate,
  authorizeRoles("admin"),
  updateUserRole,
);

export default router;
