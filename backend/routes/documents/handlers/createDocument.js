
import documentsModel from '../../../models/documents.js';

const createDocument = async function createDocument(request, response) {
    try {
        const { user, title, content } = request.body;
        const data = await documentsModel.createDocument(user, title, content);

        // 201 Created
        response.status(201).json({
            data: {
                data: data
            }
        });
    } catch (error) {
        // Handle errors and send an appropriate response
        response.status(500).json({
            errors: {
                status: 500,
                source: "/",
                title: "Database error",
                detail: error.message
            }
        });
    }
};

export default createDocument;