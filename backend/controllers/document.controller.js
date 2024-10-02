import Document from '../models/document.model.js';
import errorLogger from '../utils/errorLogger.js';
import statusCodes from "../utils/HttpStatusCodes.js";
import returner from '../utils/returner.js';
import User from '../models/user.model.js';

class DocumentController {
  // Method for creating a new document
  async createDocument(req, res) {
    //const userId = res.locals.authenticatedUser;
    const testUser = await User.findOne({email: "test@test.com"});
  
    try {
      const { title } = req.body;
      const docData = {
        title,
        usersWithAccess: [{
          _id: testUser.id,
          accessLevel: "owner"
        }]
      }
      const document = new Document(docData);
      await document.save();
      return returner(res, "success", statusCodes.CREATED, document, "");
    } catch (error) {
      errorLogger(error.message);
      return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
  }

  // Method for fetching all documents
  async getDocuments(req, res) {
    //const userId = res.locals.authenticatedUser;
    const testUser = await User.findOne({email: "test@test.com"});

    try {
      const userDocs = await Document.find({ "usersWithAccess._id": testUser.id });
      const jsonDocs = userDocs.map(doc => doc.toJSON());

      return returner(res, "success", statusCodes.OK, jsonDocs, "");
    } catch (error) {
      errorLogger(error.message);
      return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
  }

  // Method for fetching a single document by ID
  async getDocumentById(req, res) {
    //const userId = res.locals.authenticatedUser._id;
    const testUser = await User.findOne({email: "test@test.com"});

    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return returner(res, "error", statusCodes.NOT_FOUND, null, "Document not found");
      }
      const hasAccess = document.usersWithAccess.find(access => access._id.equals(testUser.id));
      
      if (!hasAccess) return returner(res, "error", statusCodes.FORBIDDEN, null, "You don't have access to this document");
      return returner(res, "success", statusCodes.OK, document, "");
    } catch (error) {
      errorLogger(error.message);
      return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
  }

  // Method for updating a document
  async updateDocument(req, res) {
    const userId = res.locals.authenticatedUser;
    const testUser = await User.findOne({email: "test@test.com"});

    try {
      // Find the document and check if the user has 'owner' or 'editor' access
      const document = await Document.findOneAndUpdate({
        _id: req.params.id,
        "usersWithAccess._id": testUser.id,
        $or: [
          { "usersWithAccess.accessLevel": "owner" },
          { "usersWithAccess.accessLevel": "editor" }
        ]
      }, req.body, {new: true});

      // If no document is found or the user doesn't have the required access
      if (!document) {
        return returner(res, "error", statusCodes.FORBIDDEN, null, "Document not found");
      }

      // Return the updated document
      return returner(res, "success", statusCodes.OK, document, "");
    } catch (error) {
      errorLogger(error.message);
      return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
  }

  // Method for deleting a document by ID
  async deleteDocument(req, res) {
    const userId = res.locals.authenticatedUser;

    try {
      const document = await Document.findOneAndDelete({
        _id: req.params.id,
        "usersWithAccess._id": userId,
        "usersWithAccess.accessLevel": "owner"
      });

      // If no document is found or the user doesn't have the required access
      if (!document) {
        return returner(res, "error", statusCodes.FORBIDDEN, null, "Document not found");
      }
      return returner(res, "success", statusCodes.OK, null, "");
    } catch (error) {
      errorLogger(error.message);
      return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
  }
}

// Export an instance of the DocumentController class
export default new DocumentController();
