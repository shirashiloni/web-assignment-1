import express from "express";
import PostController from "../controllers/post.js";
const router = express.Router();

router.get("/", PostController.getAll.bind(PostController));
router.get("/:id", PostController.getById.bind(PostController));
router.post("/", PostController.create.bind(PostController));
router.delete("/:id", PostController.del.bind(PostController));
router.put("/:id", PostController.update.bind(PostController));

export default router;