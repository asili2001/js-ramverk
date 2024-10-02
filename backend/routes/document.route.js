import express from 'express';
import DocumentController from '../controllers/document.controller.js';

import AuthMiddleware from '../middlewares/checkAuth.js';
import DocumentValidator from '../middlewares/validators/document.validator.js';

const router = express.Router();
const authMiddleware = new AuthMiddleware();
const documentValidator = new DocumentValidator();

// Define routes for documents
router.post('/', documentValidator.newDocument, DocumentController.createDocument);
router.get('/', DocumentController.getDocuments);
router.get('/:id', DocumentController.getDocumentById);
router.put('/:id', documentValidator.updateDocument, DocumentController.updateDocument);
router.delete('/:id', DocumentController.deleteDocument);

export default router;
