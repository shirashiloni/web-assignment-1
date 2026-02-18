import postModel from "../model/post.js";
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
            const posts = await this.model.find({ tags: { $in: tags } });
            res.json({ posts, tags });
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

    async update(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const post = await this.model.findById(id);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }

            if (req.body.userId && req.body.userId !== post.userId.toString()) {
                res.status(403).send("Cannot change creator of the post");
                return;
            }
            super.update(req, res);
            return;
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Error updating post");
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
}

export default new PostController();
