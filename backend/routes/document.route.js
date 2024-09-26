import express from 'express';
import { 
  createDocument, 
  getDocuments, 
  getDocumentById, 
  updateDocument,
  deleteDocument 
} from '../controllers/document.controller.js';
import AuthMiddleware from '../middlewares/checkAuth.js';

const router = express.Router();
const authMiddleware = new AuthMiddleware();

// Define routes for documents
router.post('/', authMiddleware.checkUser, createDocument);         // Create a new document
router.get('/', authMiddleware.checkUser, getDocuments);            // Fetch all documents
router.get('/:id', authMiddleware.checkUser, getDocumentById);      // Fetch a single document by ID
router.put('/:id', authMiddleware.checkUser, updateDocument);       // Update a document by ID
router.delete('/:id', authMiddleware.checkUser, deleteDocument);    // Delete a document by ID

export default router;
