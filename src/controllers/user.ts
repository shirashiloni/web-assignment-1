import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../model/user";

const sendError = (code: number, message: string, res: Response) => {
    res.status(code).json({ message });
}

const generateToken = (userId: string) => {
    //TODO: Generate token
    return { token: "", refreshToken: "" };
}

const refreshToken = async (req: Request, res: Response) => {
    //TODO: Refresh token
    return { token: "", refreshToken: "" };
}

const register = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    const userId = req.body.userId; // Assuming userId is passed from frontend or generated
    if (!email || !password || !userId) {
        return sendError(400, "Email, password and userId are required", res);
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ "email": email, "password": hashedPassword, "userId": userId });
        const tokens = generateToken(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.status(201).json(tokens);
    } catch (err) {
        return sendError(500, "Internal server error", res);
    }
}
const login = async (req: Request, res: Response) => {
    // Login logic here
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return sendError(400, "Email and password are required", res);
    }
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return sendError(401, "Invalid email or password 1", res);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(401, "Invalid email or password 2", res);
        }

        const tokens = generateToken(user._id.toString());

        //TODO Remove expired refresh tokens

        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).json(tokens);

    } catch (err) {
        return sendError(500, "Internal server error", res);
    }
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
    register,
    login,
    refreshToken,
    updateUser,
    deleteUser
};