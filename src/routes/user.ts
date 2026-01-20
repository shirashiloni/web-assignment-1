import express from "express";
import UserController from "../controllers/user.js";

const router = express.Router();

router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
