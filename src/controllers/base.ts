
import type { Request, Response } from "express";

class BaseController {
    model: any;

    constructor(model: any) {
        this.model = model;
    }

    async getAll(req: Request, res: Response) {
        try {
            const { page: _page, limit: _limit, ...filters } = req.query;
            
            const page = parseInt(_page as string || '1', 10);
            const limit = parseInt((_limit as string) || '10', 10);
            const skip = (page - 1) * limit;


            const totalDocs = await this.model.countDocuments(filters);
            const totalPages = Math.ceil(totalDocs / limit);

            const data = await this.model.find(filters).skip(skip).limit(limit);

            res.json({
                data,
                totalPages
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving posts");
        }
    }

    async getById(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const data = await this.model.findById(id);
            if (!data) {
                return res.status(404).send("Post not found");
            } else {
                res.json(data);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving post by ID");
        }
    };

    async create(req: Request, res: Response) {
        const postData = req.body;
        try {
            postData.createDate = new Date();
            const data = await this.model.create(postData);
            res.status(201).json(data);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error creating post");
        }
    };

    async del(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const deletedData = await this.model.findByIdAndDelete(id);
            if (!deletedData) {
                 res.status(404).send("Post not found");
                 return;
            }
            res.status(200).json(deletedData);
            console.log("delete data -----" + deletedData);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting post");
        }
    };

    async update(req: Request, res: Response) {
        const id = req.params.id;
        const updatedData = req.body;
        try {
            const data = await this.model.findByIdAndUpdate(id, updatedData, {
                new: true,
            });

            if (!data) {
                res.status(404).send("Post not found");
                return;
            }
            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error updating post");
        }
    };
};
export default BaseController
