
import documentsModel from '../../../models/documents.js';

const deleteDocument = async function deleteDocument(request, response) {
    const id = request.params.id;
    await documentsModel.deleteDocument(id);

    // DELETE requests should return 204 No Content
    result.status(204).send();
};

export default deleteDocument;