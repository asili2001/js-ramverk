
import documentsModel from '../../../models/documents.js';

const createDocument = async function createDocument(request, response) {
    const data = await documentsModel.createDocument();

    // 201 Created
    response.status(201).json({
        data: {
            data: data
        }
    });
};

export default createDocument;