const Document = require('../models/document.model.js');
const LZString = require('lz-string');
const fs = require('fs');
const appRoot = require('app-root-path');
const User = require('../models/user.model.js');
const mongoose = require('mongoose');
const { GraphQLError } = require('graphql');

const { ObjectId } = mongoose.Types;


class DocumentController {
    // Method for creating a new document
    async createDocument(userId, title) {
        const getUser = await User.findById(userId);
        try {
            const docData = {
                title,
                usersWithAccess: [{
                    user: getUser,
                    accessLevel: "owner"
                }]
            }
            const document = new Document(docData);
            await document.save();
            return document;
        } catch (error) {
            console.error('Error in creating document:', error);
            throw new GraphQLError("Internal server error occurred while creating document.", {
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: 500,
            });
        }
    }

    // Method for fetching all documents
    async getDocuments(userId, type) {
        try {
            let userDocs = [];

            switch (type) {
                case "own":
                    userDocs = await Document.find({
                        usersWithAccess: { 
                            $elemMatch: {
                                "user": userId, 
                                accessLevel: "owner" 
                            } 
                        }
                    }).populate("usersWithAccess.user");
                    break;
                case "shared":
                    userDocs = await Document.find({
                        usersWithAccess: { 
                            $elemMatch: { 
                                "user": userId,
                                $or: [
                                    { accessLevel: "reader" },
                                    { accessLevel: "editor" }
                                ]
                            } 
                        }
                    }).populate("usersWithAccess.user");
                    break;
                default:
                    userDocs = await Document.find({
                        "usersWithAccess.user": userId
                    }).populate("usersWithAccess.user");
                    break;
            }            

            const jsonDocs = userDocs.map(doc => doc.toJSON());
            return jsonDocs;

        } catch (error) {
            console.error('Fetching documents error:', error);
            throw new GraphQLError("Internal server error occurred while fetching documents.", {
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: 500,
            });
        }
    }

    // Method for fetching a single document by ID
    async getDocumentById(userId, docId) {
        try {
            if (!ObjectId.isValid(docId)) {
                throw new Error("Document Not Found");
            }
            // get document from files
            let dbDocument = await Document.findById(docId).populate("usersWithAccess.user");
            
            if (!dbDocument) {
                throw new Error("Document Not Found");
            }
            const documentOwner = dbDocument.usersWithAccess.find(access => access.accessLevel === "owner");
            if (!documentOwner) {
                throw new GraphQLError("Document not found", {
                    code: 'NOT_FOUND',
                    statusCode: 404
                });
            }

            const hasAccess = dbDocument.usersWithAccess.find(access => access.user._id.equals(userId));

            if (!hasAccess) {
                throw new GraphQLError("You don't have access to this document", {
                    code: 'FORBIDDEN',
                    statusCode: 403
                });
            }            

            const usersWithAccess = dbDocument.usersWithAccess.map(access => {
                let updatedUser = {
                    user: {...access.user._doc, id: access.user._id.toString()},
                    accessLevel: access.accessLevel,
                    isRequester: access.user._id.equals(userId)
                };

                return updatedUser;
            });

            const document = { ...dbDocument.toJSON(), usersWithAccess: usersWithAccess };

            const dir = `${appRoot.path}/drafts/${documentOwner.user._id}/${docId}`;
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

            const fileContent = fs.readFileSync(filePath, 'utf8');
            const compressedFileContent = LZString.compress(fileContent);
            

            return { ...document, content: compressedFileContent };

        } catch (error) {
            console.error('Fetching document error:', error);
            if (error instanceof GraphQLError) {
                throw error;
            }
            throw new GraphQLError("Internal server error occurred during fetching document.", {
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: 500,
            });
        }
    }

    // Method for deleting a document by ID
    async deleteDocument(userId, docId) {
        try {
            if (!ObjectId.isValid(docId)) {
                throw new GraphQLError("Document not found", {
                    code: 'NOT_FOUND',
                    statusCode: 404
                });
            }
            const document = await Document.findOneAndDelete({
                _id: docId,
                "usersWithAccess.user": userId,
                "usersWithAccess.accessLevel": "owner"
            });

            // If no document is found or the user doesn't have the required access
            if (!document) {
                throw new GraphQLError("Document not found", {
                    code: 'NOT_FOUND',
                    statusCode: 404
                });
            }

            const dir = `${appRoot.path}/drafts/${userId}/${docId}`;
            fs.rmSync(dir, { recursive: true });
            return true;
        } catch (error) {
            console.error('Delete document error:', error);
            if (error instanceof GraphQLError) {
                throw error;
            }
            throw new GraphQLError("Internal server error occurred during document deletion.", {
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: 500,
            });
        }
    }

    // Method for sharing a document
    async shareDocument(userId, docId, shareWithEmail, accessLevel) {
        try {
            if (!ObjectId.isValid(docId)) {
                throw new Error("Document Not Found");
            }
            const owner = await User.findById(userId);
            if (owner.email === shareWithEmail) {
                throw new GraphQLError("You already have access to your own documents", {
                    code: 'BAD_REQUEST',
                    statusCode: 400
                });
            }
            const document = await Document.findOne({
                _id: docId,
                "usersWithAccess.user": userId,
                "usersWithAccess.accessLevel": "owner"
            }).populate("usersWithAccess.user");

            
            
            // If no document is found or the user doesn't have the required access
            if (!document) {
                throw new GraphQLError("Document not found", {
                    code: 'NOT_FOUND',
                    statusCode: 404
                });
            }
            const shareWithUser = await User.findOne({ email: shareWithEmail });
            if (!shareWithUser) {
                throw new GraphQLError("User with this email not found", {
                    code: 'NOT_FOUND',
                    statusCode: 404
                });
            }

            const userExist = document.usersWithAccess.find(access => access.user._id.toString() === shareWithUser._id.toString());
            
            
            if (!userExist) {
                const newAccess = {
                    user: {...shareWithUser},
                    accessLevel: accessLevel === "editor" ? "editor" : "reader"
                };
                document.usersWithAccess.push(newAccess);
            } else {
                const updatedAccess = document.usersWithAccess.map(access => {
                    
                    if (access.user._id.equals(shareWithUser._id)) {
                        access.accessLevel = accessLevel;
                    }
                    return access;
                });
                
                document.usersWithAccess = [...updatedAccess];
            }
            document.save();
            return true;
        } catch (error) {
            console.error('Document share error:', error);
            if (error instanceof GraphQLError) {
                throw error;
            }
            throw new GraphQLError("Internal server error occurred while sharing document.", {
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: 500,
            });
        }
    }
}

// Export an instance of the DocumentController class
module.exports = new DocumentController();