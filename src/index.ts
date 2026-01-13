import dotenv from 'dotenv';
import initServer from './server.js';
import connectDB from './db.js';

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error("Error: JWT_SECRET or JWT_REFRESH_SECRET must be defined in .env file");
    process.exit(1);
}

const initProject = async () => {
    await connectDB();
    await initServer();
};

initProject();

export default initProject;