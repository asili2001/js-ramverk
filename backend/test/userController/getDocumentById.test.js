//const assert = require('assert');
const sinon = require('sinon');

const DocumentController = require('../../src/controllers/document.controller.js');
const Document = require('../../src/models/document.model.js');


describe('DocumentController getDocumentById tests', () => {
    let req, res;

    beforeEach(function () {
        req = {
            body: { title: 'Test Document' },
            params: { id: "testUser1234" }
        };
        res = {
            locals: { authenticatedUser: { _id: 'testUser1234' } },
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        };


        sinon.stub(Document, 'findById').returnsThis(); 

    });

    afterEach(function () {
        sinon.restore();
    });

    describe('get document by id successfully', () => {
        it('should return correct document', async () => {
            const controller = DocumentController;
            await controller.getDocumentById(req, res);

            //assert(Document.find.calledWith("testUser1234"));
            //assert(Document.find.calledWith({ "usersWithAccess._id": 'testUser1234' }));

            // Access the response body from res.json
            //const responseBody = res.json.getCall(0).args[0];

        });
    });
});