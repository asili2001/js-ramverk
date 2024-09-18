
import documentsModel from '../../../models/documents.js';

const getDocuments = async function getDocuments(request, response) {
    try {
        const data = await documentsModel.getAllDocuments();
        response.json({
            data: {
                data: data
            }
        });
    } catch(error) {
        return response.status(500).json({
            errors: {
                status: 500,
                source: "/",
                title: "Database error",
                detail: error.message
            }
        });
    }
};

export default getDocuments;