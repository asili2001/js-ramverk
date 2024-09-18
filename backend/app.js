/*
    RESTful API with JSON-responses
*/
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';

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
//const errorMiddleware = require('./middleware/error');
import errorMiddleware from './middleware/error.js';
app.use(errorMiddleware);


const port = 1338;
// Start up server
app.listen(port, () => console.log(`Example API listening on port ${port}!`));