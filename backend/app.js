import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import morgan from 'morgan';
// Load environment variables from the .env file
import dotenv from '@dotenvx/dotenvx';

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: `${process.env.PWD}/${envFile}` });


import connectDB from './config/db.js';
import userRoutes from './routes/user.route.js';
import documentRoutes from './routes/document.route.js';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

// Connect to the database
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);


// Start up server
app.listen(process.env.SERVER_PORT, () => console.log(`INKER API listening on port ${process.env.SERVER_PORT}!`));
