
import documentsModel from '../../../models/documents.js';

const getDocuments = async function getDocuments(request, response) {
    const data = await documentsModel.getAllDocuments();

    // Lägg till try/catch felhantering!

    response.json({
        data: {
            data: data
        }
    });
};

export default getDocuments;