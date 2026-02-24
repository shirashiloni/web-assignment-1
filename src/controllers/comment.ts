import commentModel from "../model/comment.js";
import postModel from "../model/post.js";
import type { Request, Response } from "express";
import BaseController from "./base.js";

class CommentController extends BaseController {

    constructor() {
        super(commentModel);
    }


    async create(req: Request, res: Response) {
        const result = await super.create(req, res);
        try {
            const postId = req.body.postId;
            if (postId) {
                await postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
            }
        } catch (err) {
            console.error('Failed to increment commentsCount:', err);
        }
        return result;
    }

    async del(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }
            if (comment.postId) {
                await postModel.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
            }
            super.del(req, res);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting comment");
        }
    };

    async update(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const comment = await this.model.findById(id);
            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }
            if (req.body.userId && req.body.userId !== comment.userId.toString()) {
                res.status(403).send("Cannot change creator of the comment");
                return;
            }
            super.update(req, res);
            return;
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Error updating comment");
        }
    };
}

export default new CommentController();
