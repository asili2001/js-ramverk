
import documentsModel from '../../../models/documents.js';

const updateDocument = async function updateDocument(request, response) {
    try {
        const id = request.params.id;
        const updateData = request.body;

        await documentsModel.updateDocument(id, updateData);
        response.status(204).send();
    } catch (error) {
        console.error('Error updating document:', error.message);
        response.status(500).json({ message: error.message });
    }
};

export default updateDocument;