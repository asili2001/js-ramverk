const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
require('dotenv').config({ path: `${__dirname}/../${envFile}` });

const connectDB = require('./config/db.js');
const userRoutes = require('./routes/user.route.js');
const documentRoutes = require('./routes/document.route.js');

const app = express();

const allowedOrigins = ['http://localhost:5173', 'https://inker.ahmadasi.li'];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('combined'));

// Connect to the database
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);

// Start up server
app.listen(process.env.PORT || process.env.PORT, () => console.log(`INKER API listening on port ${process.env.PORT}!`));
