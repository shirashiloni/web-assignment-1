import express from "express";
import UserController from "../controllers/user.js";
import authMiddleware from "../middlewares/auth_middleware.js";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User endpoints
 */

/**
 * @swagger
router.get("/:id", UserController.getUserById);
 * /user/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
	*           schema:
	*             type: object
	*             properties:
	*               userId:
	*                 type: string
	*               email:
	*                 type: string
	*               password:
	*                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */


const router = express.Router();


router.get("/me", authMiddleware, UserController.getMe);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);
router.get("/:id", UserController.getUserById);

export default router;
