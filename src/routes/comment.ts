import express from "express";
import CommentController from "../controllers/comment.js";

const router = express.Router();

router.get("/", CommentController.getAll.bind(CommentController));
router.get("/:id", CommentController.getById.bind(CommentController));
router.post("/", CommentController.create.bind(CommentController));
router.delete("/:id", CommentController.del.bind(CommentController));
router.put("/:id", CommentController.update.bind(CommentController));

export default router;