import express from "express";
import UserController from "../controllers/user.js";

const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/refresh", UserController.refreshToken);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
