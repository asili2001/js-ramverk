var express = require('express');
var router = express.Router();

const documentsModel = require('./models/documents');

// Testing routes with method
router.get("/", async function(request, response) {
    const documents = await documentsModel.getAllDocuments();

    response.json({
        data: {
            documents: documents
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