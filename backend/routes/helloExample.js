var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    const data = {
        data: {
            msg: "Hello World"
        }
    };

    res.json(data);
});


router.get("/hello/:msg", function(request, response) {
    const data = {
        data: {
            msg: request.params.msg
        }
    };

    response.json(data);
});


module.exports = router;