import postModel from "../model/post.js";
import likeModel from "../model/like.js";
import type { Request, Response } from "express";
import BaseController from "./base.js";
import { generateTagsForPost } from '../services/ai_keywords.js';
import { extractKeywordsFromQuery } from '../services/ai_keywords.js';

class PostController extends BaseController {
    async searchByText(req: Request, res: Response) {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ error: "Missing search query (q)" });
        }

        try {
            const tags = await extractKeywordsFromQuery(query);
            const posts = await this.model.find({ tags: { $in: [...tags, query] } });
            res.json({ data: posts, tags });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to search posts" });
        }
    }

    constructor() {
        super(postModel);
    }

    async create(req: Request, res: Response) {
        try {
            const { caption, ...rest } = req.body;
            const tags = await generateTagsForPost({ caption, ...rest });
            req.body.tags = tags;
        } catch (e) {
            req.body.tags = [];
        }
        return super.create(req, res);
    }

    async del(req: Request, res: Response) {
        const id = req.params.id;

        try {
            const post = await this.model.findById(id);

            if (!post) {
                res.status(404).send("Post not found");
                return;
            }
            super.del(req, res);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting post");
        }
    };

    async getBySender(req: Request, res: Response) {
        const userId = req.params.userId;
        try {
            const posts = await this.model.find({ userId });
            res.json(posts);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving posts by sender");
        }
    }

    async likePost(req: Request, res: Response) {
        const postId = req.params.id;
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: "Missing userId" });
        }
        try {
            const post = await this.model.findById(postId);
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            const existingLike = await likeModel.findOne({ postId, userId });
            if (!existingLike) {
                await likeModel.create({ postId, userId });
                post.likeCount = (post.likeCount || 0) + 1;
                await post.save();
            }
            res.json({ likeCount: post.likeCount });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to like post" });
        }
    }

    async unlikePost(req: Request, res: Response) {
        const postId = req.params.id;
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: "Missing userId" });
        }
        try {
            const post = await this.model.findById(postId);
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }
            const like = await likeModel.findOneAndDelete({ postId, userId });
            if (like && post.likeCount > 0) {
                post.likeCount = post.likeCount - 1;
                await post.save();
            }
            res.json({ likeCount: post.likeCount });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to unlike post" });
        }
    }
}

export default new PostController();
