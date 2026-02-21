import likeModel from "../model/like.js";
import BaseController from "./base.js";
import type { Request, Response } from "express";

class LikeController extends BaseController {
    constructor() {
        super(likeModel);
    }

    async getUserLikeStatus(req: Request, res: Response) {
    const { postId, userId } = req.query;
    if (!postId || !userId) {
        return res.status(400).json({ error: "Missing postId or userId" });
    }
    try {
        const like = await likeModel.findOne({ postId, userId });
        res.json({ liked: !!like });
    } catch (err) {
        res.status(500).json({ error: "Failed to check like status" });
    }
}

}

export default new LikeController();
