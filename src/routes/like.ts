import express from "express";
import LikeController from "../controllers/like.js";

/**
 * @swagger
 * tags:
 *   name: Like
 *   description: Like endpoints
 */

/**
 * @swagger
 * /like/status:
 *   get:
 *     summary: Get the like status of a post for a specific user
 *     tags: [Like]
 *     parameters:
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Like status returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *       400:
 *         description: Missing postId or userId
 *       500:
 *         description: Failed to check like status
 */

const router = express.Router();

router.get("/status", LikeController.getUserLikeStatus.bind(LikeController));

export default router;