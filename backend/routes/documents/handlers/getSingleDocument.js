
import documentsModel from '../../../models/documents.js';

const getSingleDocument = async function getSingleDocument(request, response) {
    const id = request.params.id;
    const data = await documentsModel.getSingleDocument(id);

    response.json({
        data: {
            data: data
        }
    });
};

export default getSingleDocument;