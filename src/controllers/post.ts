import postModel from "../model/post.js";
import type { Request, Response } from "express";
import BaseController from "./base.js";

class PostController extends BaseController {

    constructor() {
        super(postModel);
    }

    async create(req: Request, res: Response) {
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
                res.status(400).send("Cannot change creator of the post");
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
