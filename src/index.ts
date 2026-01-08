import dotenv from 'dotenv';
import initServer from './server.js';
import connectDB from './db.js';

dotenv.config();

const initProject = async () => {
    await connectDB();
    await initServer();
};

initProject();

export default initProject;