import express from 'express';
import postRouter from './routes/post.js';

export const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use("/post", postRouter);

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
