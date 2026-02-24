import express from "express";
import PostController from "../controllers/post.js";

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: Post endpoints
 */

/**
 * @swagger
 * /post/:
 *   get:
 *     summary: Get all posts
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: Paginated list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalPages:
 *                   type: integer
 *   post:
 *     summary: Create a new post
 *     tags: [Post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caption
 *               - userId
 *             properties:
 *               caption:
 *                 type: string
 *               userId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 *   delete:
 *     summary: Delete post by ID
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *       404:
 *         description: Post not found
 *   put:
 *     summary: Update post by ID
 *     tags: [Post]
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
 *               caption:
 *                 type: string
 *               userId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /post/user/{userId}:
 *   get:
 *     summary: Get posts by user ID
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts by user
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /post/search:
 *   get:
 *     summary: Search posts by free text using AI-generated tags
 *     tags: [Post]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Free text to search for relevant posts
 *     responses:
 *       200:
 *         description: List of matching posts and extracted tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Failed to search posts
 */

/**
 * @swagger
 * /post/{id}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Like recorded, returns updated likeCount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likeCount:
 *                   type: integer
 *       400:
 *         description: Missing userId
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /post/{id}/unlike:
 *   post:
 *     summary: Unlike a post
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Like removed, returns updated likeCount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likeCount:
 *                   type: integer
 *       400:
 *         description: Missing userId
 *       404:
 *         description: Post not found
 */

const router = express.Router();

router.get("/", PostController.getAll.bind(PostController));
router.get("/search", PostController.searchByText.bind(PostController));
router.get("/:id", PostController.getById.bind(PostController));
router.post("/", PostController.create.bind(PostController));
router.delete("/:id", PostController.del.bind(PostController));
router.put("/:id", PostController.update.bind(PostController));
router.get("/user/:userId", PostController.getBySender.bind(PostController));
router.post("/:id/like", PostController.likePost.bind(PostController));
router.post("/:id/unlike", PostController.unlikePost.bind(PostController));

export default router;