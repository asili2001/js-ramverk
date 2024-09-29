import express from 'express';
import DocumentController from '../controllers/document.controller.js';

import AuthMiddleware from '../middlewares/checkAuth.js';
import DocumentValidator from '../middlewares/validators/document.validator.js';

const router = express.Router();
const authMiddleware = new AuthMiddleware();
const documentValidator = new DocumentValidator();

// Define routes for documents
router.post('/', authMiddleware.checkUser, documentValidator.newDocument, DocumentController.createDocument);
router.get('/', authMiddleware.checkUser, DocumentController.getDocuments);
router.get('/:id', authMiddleware.checkUser, DocumentController.getDocumentById);
router.put('/:id', authMiddleware.checkUser, documentValidator.updateDocument, DocumentController.updateDocument);
router.delete('/:id', authMiddleware.checkUser, DocumentController.deleteDocument);

export default router;
