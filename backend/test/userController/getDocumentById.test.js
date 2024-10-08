const assert = require('assert');
const sinon = require('sinon');

const DocumentController = require('../../src/controllers/document.controller.js');
const Document = require('../../src/models/document.model.js');
const returner = require('../../src/utils/returner.js');
const User = require('../../src/models/user.model.js');


describe('DocumentController getDocumentById tests', () => {
    let req, res, stubUser;

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

        stubUser = sinon.stub(User, 'findOne').resolves({
            id: 'testUser1234',
            email: 'test@test.com',
            username: 'John Doe'
        });

        const mockDocument = {
            title: 'Test Document',
            usersWithAccess: [
                {
                    _id: 'testUser1234',
                    accessLevel: 'owner'
                }
            ],
            _id: 'mockedObjectId'
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