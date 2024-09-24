
import documentsModel from '../../../models/documents.js';

const createDocument = async function createDocument(request, response) {
    try {
        const { title } = request.body;
        const data = await documentsModel.createDocument(title);

        // 201 Created
        response.status(201).json({
            type: "success",
            messages: [
                {
                    type: "success",
                    title: "Message: Success",
                    details: "Everything went ok"
                }
            ],
            data: data
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