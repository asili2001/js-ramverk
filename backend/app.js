/*
    RESTful API with JSON-responses
*/

const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const morgan = require('morgan');

const app = express();



app.use(cors());
// application/json
app.use(bodyParser.json());
// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


// Middleware
//const logsMiddleware = require('./middleware/logs');
const errorMiddleware = require('./middleware/error');


// Routes
const index = require('./routes/index');
const hello = require('./routes/hello');
const user = require('./routes/user');



// Logs middleware
//app.use(logsMiddleware.Logs);

if (process.env.NODE_ENV !== 'test') {

    app.use(morgan('combined'));
}


// Routes
app.use('/', index);
app.use('/hello', hello);
app.use('/user', user);


// Error middleware
app.use(errorMiddleware.errorHandler);




const port = 1338;
// Start up server
app.listen(port, () => console.log(`Example API listening on port ${port}!`));