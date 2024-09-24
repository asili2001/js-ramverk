
import documentsModel from '../../../models/documents.js';

const deleteDocument = async function deleteDocument(request, response) {
    try {
        const id = request.params.id;
        await documentsModel.deleteDocument(id);

        // DELETE requests should return 204 No Content
        response.status(204).send();

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

export default deleteDocument;