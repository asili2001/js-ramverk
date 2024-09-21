/*
    RESTful API with JSON-responses
*/
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import database from './mongodb/database.js';
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Logs
//app.use(logsMiddleware.Logs);
if (process.env.NODE_ENV !== 'test') {

    app.use(morgan('combined'));
}



// Routes
import documents from './routes/documents/index.js';

// Routes
app.use('/', documents);



// Errors
import errorMiddleware from './middleware/error.js';
app.use(errorMiddleware);


// initialize database, create collection blueprints
try {
    await database.initializeDatabase();
} catch(error) {
    console.error('Failed to initialize database:', error);
}

const port = 1338;
// Start up server
app.listen(port, () => console.log(`Example API listening on port ${port}!`));