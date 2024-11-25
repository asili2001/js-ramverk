const express = require('express');
const DocumentController = require('../controllers/document.controller.js');

const AuthMiddleware = require('../middlewares/checkAuth.js');
const DocumentValidator = require('../middlewares/validators/document.validator.js');


const router = express.Router();
const authMiddleware = new AuthMiddleware();
const documentValidator = new DocumentValidator();

// Define routes for documents
router.post('/', authMiddleware.checkUser, documentValidator.newDocument, DocumentController.createDocument);
router.get('/', authMiddleware.checkUser, DocumentController.getDocuments);
router.get('/:id', authMiddleware.checkUser, DocumentController.getDocumentById);
router.put('/:id', authMiddleware.checkUser, documentValidator.updateDocument, DocumentController.updateDocument);
router.put('/code/:id', authMiddleware.checkUser, documentValidator.updateDocument, DocumentController.updateCodeDocument);
router.delete('/:id', authMiddleware.checkUser, DocumentController.deleteDocument);

module.exports = router;
