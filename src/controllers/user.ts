import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../model/user";

const sendError = (code: number, message: string, res: Response) => {
    res.status(code).json({ message });
}

const updateUser = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { userId, password } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return sendError(404, "User not found", res);
        }

        if (userId) {
            // Check uniqueness if changing userId
            if (userId !== user.userId) {
                const existingUser = await User.findOne({ userId });
                if (existingUser) {
                    return sendError(400, "UserId already taken", res);
                }
                user.userId = userId;
            }
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        await user.save();
        res.status(200).json({
            _id: user._id,
            userId: user.userId,
            email: user.email
        });
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
    deleteUser
};