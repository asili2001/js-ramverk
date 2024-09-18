
import documentsModel from '../../../models/documents.js';

const updateDocument = async function updateDocument(request, response) {
    const id = request.params.id;
    await documentsModel.updateDocument(id);

    // PUT requests should return 204 No Content
    result.status(204).send();
};

export default updateDocument;