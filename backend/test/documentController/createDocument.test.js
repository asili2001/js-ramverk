import assert from 'assert';
import Document from '../models/document.model.js';
import errorLogger from '../utils/errorLogger.js';
import statusCodes from "../utils/HttpStatusCodes.js";
import returner from '../utils/returner.js';
import DocumentController from '../controllers/document.controller.js';


class MockDocument {
    constructor(docData) {
        this.docData = docData;
    }

    save() {
        return Promise.resolve(this.docData);
    }
}

// mock returner function
function mockReturner(res, status, code, data, message) {
    res.statusCode = code;
    res.body = { status, data, message };
    return res;
}

function mockErrorLogger(message) {
    console.error(message);
}



describe('DocumentController.createDocument tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: { title: 'Test Document' },
        };
        res = {
            locals: { authenticatedUser: 'userId123' },
            statusCode: null,
            body: null,
        };

        global.Document = MockDocument;
        global.returner = mockReturner;
        global.errorLogger = mockErrorLogger;
    });

    afterEach(() => {
        delete global.Document;
        delete global.returner;
        delete global.errorLogger;
    });

    it('should create a document successfully', async () => {
        const controller = DocumentController;
        await controller.createDocument(req, res);

        // Assertions
        assert.strictEqual(res.statusCode, statusCodes.CREATED, 'Status code should be CREATED');
        assert.strictEqual(res.body.status, 'success', 'Response should have status "success"');
        assert.strictEqual(res.body.data.title, 'Test Document', 'Document title should match');
        assert.strictEqual(res.body.data.usersWithAccess[0]._id, 'userId123', 'User ID should match');
        assert.strictEqual(res.body.data.usersWithAccess[0].accessLevel, 'owner', 'Access level should be "owner"');
    });
});
