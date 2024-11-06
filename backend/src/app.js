const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
require('dotenv').config({ path: `${__dirname}/../${envFile}` });

const connectDB = require('./config/db.js');
const userRoutes = require('./routes/user.route.js');
const documentRoutes = require('./routes/document.route.js');

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

const app = express();
const httpServer = http.createServer(app);


const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('combined'));

// Connect to the database
connectDB();

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);


// Start the server
httpServer.listen(process.env.API_PORT, () => {
    console.log(`Server listening on port ${process.env.API_PORT}!`);
});