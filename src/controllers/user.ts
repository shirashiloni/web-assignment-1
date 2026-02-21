import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../model/user";

const sendError = (code: number, message: string, res: Response) => {
    res.status(code).json({ message });
}

import { AuthRequest } from "../middlewares/auth_middleware";

const getMe = async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user._id) {
        return sendError(401, "Unauthorized", res);
    }
    try {
        const user = await User.findById(req.user._id).select("-password -refreshTokens");
        if (!user) {
            return sendError(404, "User not found", res);
        }
        res.status(200).json(user);
    } catch (err) {
        return sendError(500, "Internal server error", res);
    }
};

const updateUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, password, profileImage } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return sendError(404, "User not found", res);
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (name) {
            user.name = name;
        }

        if (profileImage) {
            user.profileImage = profileImage
        }

        await user.save();
        const { password: _, ...userResponse } = user.toObject();
        res.status(200).json(userResponse);
    } catch (err) {
        return sendError(500, "Internal server error", res);
    }
};

const deleteUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return sendError(404, "User not found", res);
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        return sendError(500, "Internal server error", res);
    }
};

export default {
    updateUser,
    deleteUser,
    getMe
};