const Document = require('../models/document.model.js');
const statusCodes = require("../utils/HttpStatusCodes.js");
const returner = require('../utils/returner.js');
const { dirname } = require('path');
const LZString = require('lz-string');
var fs = require('fs');
const appRoot = require('app-root-path');


class DocumentController {
  // Method for creating a new document
  async createDocument(req, res) {
    const userId = res.locals.authenticatedUser;
    try {
      const { title, docType } = req.body;
      const docData = {
        title,
        usersWithAccess: [{
          _id: userId,
          accessLevel: "owner"
        }],
        docType: docType
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
      // get document from files
      const document = await Document.findById(req.params.id);
      if (!document) {
        return returner(res, "error", statusCodes.NOT_FOUND, null, "Document not found");
      }
      const hasAccess = document.usersWithAccess.find(access => access._id.equals(userId));

      if (!hasAccess) return returner(res, "error", statusCodes.FORBIDDEN, null, "You don't have access to this document");

      const dir = `${appRoot.path}/drafts/${userId}/${req.params.id}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const filePath = `${dir}/document`;
      const emptyRawDraftContentState = {
        blocks: [],
        entityMap: {}
      };
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(emptyRawDraftContentState));
      }

      let fileContent = fs.readFileSync(filePath, 'utf8');
      const compressedFileContent = LZString.compress(fileContent);
      return returner(res, "success", statusCodes.OK, { ...document._doc, content: compressedFileContent }, "");
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
      }, req.body, { new: true });

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

  // Method for updating a documents comments
  async updateDocumentComments(data, documentID) {
    // const userId = res.locals.authenticatedUser;
    console.log("UPDATING COMMENT IN CONTROLLER")
    try {
      const newComment = {
        commentContent: data.commentContent,
        selectedText: data.selectedText,
        position: data.position
      };
      
      // Find the document and check if the user has 'owner' or 'editor' access
      const document = await Document.findOneAndUpdate({
        _id: documentID,
      }, { $push: { comments: newComment } }, { new: true });

      // If no document is found or the user doesn't have the required access
      if (!document) {
        console.log("NO DOCUMENT FOUND!");
        return "doc not found";
      }
      console.log("SHOULD BE OK!");

      // Return the updated document
      return "success";
    } catch (error) {
      console.log("ERROR OCCURRED!");
      console.error(error);
      return "error";
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