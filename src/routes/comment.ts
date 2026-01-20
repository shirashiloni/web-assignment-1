import express from "express";
import CommentController from "../controllers/comment.js";

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: Comment endpoints
 */

/**
 * @swagger
 * /comment/:
 *   get:
 *     summary: Get all comments
 *     tags: [Comment]
 *     responses:
 *       200:
 *         description: List of comments
 *   post:
 *     summary: Create a new comment
 *     tags: [Comment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
	*           schema:
	*             type: object
	*             properties:
	*               content:
	*                 type: string
	*               createDate:
	*                 type: string
	*                 format: date-time
	*               userId:
	*                 type: string
	*               postId:
	*                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment found
 *       404:
 *         description: Comment not found
 *   delete:
 *     summary: Delete comment by ID
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 *       404:
 *         description: Comment not found
 *   put:
 *     summary: Update comment by ID
 *     tags: [Comment]
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
	*               content:
	*                 type: string
	*               createDate:
	*                 type: string
	*                 format: date-time
	*               userId:
	*                 type: string
	*               postId:
	*                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *       404:
 *         description: Comment not found
 */

const router = express.Router();

router.get("/", CommentController.getAll.bind(CommentController));
router.get("/:id", CommentController.getById.bind(CommentController));
router.post("/", CommentController.create.bind(CommentController));
router.delete("/:id", CommentController.del.bind(CommentController));
router.put("/:id", CommentController.update.bind(CommentController));

export default router;