const assert = require('assert');
const sinon = require('sinon');

const DocumentController = require('../../src/controllers/document.controller.js');
const Document = require('../../src/models/document.model.js');


describe('DocumentController create tests', () => {
    let req, res, mockSave;
    beforeEach(function () {
        req = {
            body: { title: 'Test Document' }
        };
        res = {
            locals: { authenticatedUser: 'testUser1234' },
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        };

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
        
        mockSave = sinon.stub().resolves(mockDocument);

        sinon.stub(Document.prototype, 'save').callsFake(mockSave);

        sinon.stub(Document, 'constructor').returnsThis();
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('create document successfully', () => {
        it('should return correct status', async () => {
            const controller = DocumentController;
            await controller.createDocument(req, res);

            //assert.equal(stubUser.calledOnceWith({ email: 'test@test.com' }), true);
            assert.equal(mockSave.calledOnce, true);
            assert.equal(res.status.calledOnceWith(201), true);

            // Access the response body from res.json
            const responseBody = res.json.getCall(0).args[0];

            //console.log("BODY: ", responseBody);
            //console.log("BODY, users: ", responseBody.data.usersWithAccess[0]);

            assert.strictEqual(res.status.getCall(0).args[0], 201, 'Assert#1: Status code should be CREATED');
            assert.strictEqual(responseBody.type, 'success', `Assert#2: Expected response type to be "success", but got ${responseBody.type}`);

        });

        it('should return correct data', async () => {
            const controller = DocumentController;
            await controller.createDocument(req, res);

            //assert.equal(stubUser.calledOnceWith({ email: 'test@test.com' }), true);
            assert.equal(mockSave.calledOnce, true);
            assert.equal(res.status.calledOnceWith(201), true);

            // Access the response body from res.json
            const responseBody = res.json.getCall(0).args[0];

            assert.strictEqual(responseBody.data.title, 'Test Document', `Assert#3: Expected document title to be "Test Document", but got ${responseBody.data.title}`);
            assert.strictEqual(responseBody.data.content, null, `Assert#6: Expected content to be "null", but got ${responseBody.data.content}`);
        });

        it('should return correct user', async () => {
            const controller = DocumentController;
            await controller.createDocument(req, res);

            //assert.equal(stubUser.calledOnceWith({ email: 'test@test.com' }), true);
            assert.equal(mockSave.calledOnce, true);
            assert.equal(res.status.calledOnceWith(201), true);

            // Access the response body from res.json
            const responseBody = res.json.getCall(0).args[0];
            
            assert.strictEqual(responseBody.data.usersWithAccess[0].accessLevel, 'owner', `Assert#4: Expected access level to be "owner", but got ${responseBody.data.usersWithAccess[0].accessLevel}`);

            //assert.strictEqual(responseBody.data.usersWithAccess[0]._id, 'testUser1234', `Assert#5: Expected user ID to be "testUser1234", but got ${responseBody.data.usersWithAccess[0]._id}`);
        });
    });
});