
import type { Request, Response } from "express";

class BaseController {
    model: any;

    constructor(model: any) {
        this.model = model;
    }

    async getAll(req: Request, res: Response) {
        try {
            if (req.query) {
                const filterData = await this.model.find(req.query);
                return res.json(filterData);
            } else {
                const data = await this.model.find();
                res.json(data);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving movies");
        }
    };

    async getById(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const data = await this.model.findById(id);
            if (!data) {
                return res.status(404).send("Movie not found");
            } else {
                res.json(data);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving movie by ID");
        }
    };

    async create(req: Request, res: Response) {
        const postData = req.body;
        console.log(postData);
        try {
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
            res.status(200).json(deletedData);
            console.log("delete data -----" + deletedData);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting movie");
        }
    };

    async update(req: Request, res: Response) {
        const id = req.params.id;
        const updatedData = req.body;
        try {
            const data = await this.model.findByIdAndUpdate(id, updatedData, {
                new: true,
            });
            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error updating movie");
        }
    };
};
export default BaseController
