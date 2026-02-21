import express from "express";
import LikeController from "../controllers/like.js";

const router = express.Router();

router.get("/status", LikeController.getUserLikeStatus.bind(LikeController));

export default router;