const Document = require('../models/document.model.js');
const statusCodes = require("../utils/HttpStatusCodes.js");
const returner = require('../utils/returner.js');

class DocumentController {
  // Method for creating a new document
  async createDocument(req, res) {
    const userId = res.locals.authenticatedUser;
    try {
      const { title } = req.body;
      const docData = {
        title,
        usersWithAccess: [{
          _id: userId,
          accessLevel: "owner"
        }]
      }
      const document = new Document(docData);
      await document.save();
      return returner(res, "success", statusCodes.CREATED, document, "");
    } catch (error) {
      console.error(error);
      return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
  }

  // Method for fetching all documents
  async getDocuments(req, res) {
    const userId = res.locals.authenticatedUser;

    try {
      const userDocs = await Document.find({ "usersWithAccess._id": userId });
      const jsonDocs = userDocs.map(doc => doc.toJSON());

      return returner(res, "success", statusCodes.OK, jsonDocs, "");
    } catch (error) {
      console.error(error);
      return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
  }

  // Method for fetching a single document by ID
  async getDocumentById(req, res) {
    const userId = res.locals.authenticatedUser._id;
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return returner(res, "error", statusCodes.NOT_FOUND, null, "Document not found");
      }
      const hasAccess = document.usersWithAccess.find(access => access._id.equals(userId));
      
      if (!hasAccess) return returner(res, "error", statusCodes.FORBIDDEN, null, "You don't have access to this document");
      return returner(res, "success", statusCodes.OK, document, "");
    } catch (error) {
      console.error(error);
      return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
  }

  // Method for updating a document
  async updateDocument(req, res) {
    const userId = res.locals.authenticatedUser;

    try {
      // Find the document and check if the user has 'owner' or 'editor' access
      const document = await Document.findOneAndUpdate({
        _id: req.params.id,
        "usersWithAccess._id": userId,
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
      console.error(error);
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
      console.error(error);
      return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
  }
}

// Export an instance of the DocumentController class
module.exports = new DocumentController();