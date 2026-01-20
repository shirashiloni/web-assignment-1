import express from 'express';
import postRouter from './routes/post.js';
import commentRouter from './routes/comment.js';
import userRouter from './routes/user.js';
import authRouter from './routes/auth.js';
import AuthMiddleware from './middlewares/auth_middleware.js';

import { swaggerUiHandler, swaggerUiSetup } from './swagger.js';

export const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
// Swagger UI endpoint
app.use('/api-docs', swaggerUiHandler, swaggerUiSetup);
app.use("/auth", authRouter);
app.use("/post", AuthMiddleware, postRouter);
app.use("/comment", AuthMiddleware, commentRouter);
app.use("/user", AuthMiddleware,   userRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const initServer = async () => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
    return app;
};

export default initServer;
