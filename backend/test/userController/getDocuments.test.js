const assert = require('assert');
const sinon = require('sinon');

const DocumentController = require('../../src/controllers/document.controller.js');
const Document = require('../../src/models/document.model.js');


describe('DocumentController getDocumentById tests', () => {
    let req, res;


    const mockDocuments = [
        {
            _id: '1234',
            title: 'Document 1',
            previewImage: null,
            usersWithAccess: [
                {
                    _id: '1234user',
                    accessLevel: 'owner'
                }
            ],
            content: 'My first document',
            createdAt: '2024-10-02T22:19:11.940Z',
            updatedAt: '2024-10-02T22:27:21.503Z',
            __v: 0,
            toJSON: () => {
                return {
                    id: '1234',
                    title: 'Document 1',
                    previewImage: null,
                    usersWithAccess: [
                        {
                            _id: '1234user',
                            accessLevel: 'owner'
                        }
                    ],
                    content: 'My first document',
                    createdAt: '2024-10-02T22:19:11.940Z',
                    updatedAt: '2024-10-02T22:27:21.503Z'
                }
            }
        },
        {
            _id: '1234',
            title: 'Document 2',
            previewImage: null,
            usersWithAccess: [
                {
                    _id: '1234user',
                    accessLevel: 'owner'
                }
            ],
            content: 'This is my second document',
            createdAt: '2024-11-02T22:19:11.940Z',
            updatedAt: '2024-11-02T22:27:21.503Z',
            __v: 0,
            toJSON: () => {
                return {
                    id: '1234',
                    title: 'Document 2',
                    previewImage: null,
                    usersWithAccess: [
                        {
                            _id: '1234user',
                            accessLevel: 'owner'
                        }
                    ],
                    content: 'This is my second document',
                    createdAt: '2024-11-02T22:19:11.940Z',
                    updatedAt: '2024-11-02T22:27:21.503Z'
                }
            }
        },
    ];

    beforeEach(function () {
        req = { };
        res = {
            locals: { authenticatedUser: 'testUser1234' },
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        };

        sinon.stub(Document, 'find').resolves(mockDocuments); 
        //sinon.stub(Document, 'find').returnsThis(); 
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('get documents successfully', () => {
        it('should return correct documents', async () => {
            const controller = DocumentController;
            await controller.getDocuments(req, res);


            assert(Document.find.calledWith({ "usersWithAccess._id": 'testUser1234' }));

            const responseBody = res.json.getCall(0).args[0];

            //console.log(responseBody.data, mockDocuments.map(doc=> doc.toJSON()));
            
            assert.equal(JSON.stringify(responseBody.data), JSON.stringify(mockDocuments.map(doc=> doc.toJSON())));

        });
    });
});
