/*
    RESTful API with JSON-responses
*/
const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const morgan = require('morgan');

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
const index = require('./routes/index');
const hello = require('./routes/helloExample');
const user = require('./routes/userExample');
const documents = require('./routes/documents');



// Routes
app.use('/', index);
app.use('/hello', hello);
app.use('/user', user);
app.use('/documents', documents);



// Errors
const errorMiddleware = require('./middleware/error');
app.use(errorMiddleware.errorHandler);




const port = 1338;
// Start up server
app.listen(port, () => console.log(`Example API listening on port ${port}!`));