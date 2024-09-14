var express = require('express');
var router = express.Router();


// Testing routes with method
router.get("/", function(request, response) {
    response.json({
        data: {
            msg: "Got a GET request, sending back default 200"
        }
    });
});


router.post("/", function(request, response) {
    response.status(201).json({
        data: {
            msg: "Got a POST request, sending back 201 Created"
        }
    });
});


router.put("/", function(request, result) {
    // PUT requests should return 204 No Content
    result.status(204).send();
});


router.delete("/", function(request, result) {
    // DELETE requests should return 204 No Content
    result.status(204).send();
});


module.exports = router;