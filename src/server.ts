import express from 'express';
import postRouter from './routes/post.js';
import likeRouter from './routes/like.js';
import commentRouter from './routes/comment.js';
import userRouter from './routes/user.js';
import authRouter from './routes/auth.js';
import AuthMiddleware from './middlewares/auth_middleware.js';
import multerRoute from "./routes/multer.js";
import { swaggerUiHandler, swaggerUiSetup } from './swagger.js';

export const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.use(express.json());
// Swagger UI endpoint
app.use('/api-docs', swaggerUiHandler, swaggerUiSetup);
app.use("/auth", authRouter);
app.use("/post", AuthMiddleware, postRouter);
app.use("/comment", AuthMiddleware, commentRouter);
app.use("/user", AuthMiddleware,   userRouter);


app.use('/uploads', express.static('public/uploads'));
app.use("/upload", multerRoute);
app.use("/like", likeRouter);


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
