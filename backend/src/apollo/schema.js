const DocumentController = require("./document.controller.js");
const AuthController = require("./user.controller.js");

const typeDefs = `#graphql
    type Document {
        id: ID!
        title: String!
        previewImage: String
        usersWithAccess: [Access!]!
        createdAt: String!
        updatedAt: String!
        content: String!
        comments: [Comment]!
        docType: String!
    }
    type Comment {
        commentContent: String!
        selectedText: String!
        position: String!
    }
    type User {
        id: ID!
        name: String!
        email: String!
        isActive: Boolean!
        token: String
        role: UserRole!
    }

    enum UserRole {
        USER
        ADMIN
    }

    type Access {
        id: ID!
        user: User!
        accessLevel: AccessLevel!
        isRequester: Boolean!
    }

    enum AccessLevel {
        owner
        editor
        reader
    }

    enum DocumentType {
        OWN
        SHARED
        ALL
    }


    type Mutation {
        createDocument(title: String!, docType: String!): Document
        deleteDocument(docId: ID!): Boolean
        shareDocument(docId:ID!, shareWithEmail: String!, accessLevel: String): Boolean

        signIn(email: String!, password: String!): User
        signUp(email: String!, name: String!): User
    }

    type Query {
        getDocuments(type: DocumentType!): [Document]
        getDocument(docId: ID!): Document
    }
`;

const resolvers = {
    Query: {
        getDocument: async (_, { docId }, { authenticatedUser }) => {
            if (!authenticatedUser) {
                throw new Error("Unauthorized");
            }
            return DocumentController.getDocumentById(authenticatedUser._id, docId);
        },
        getDocuments: async (_, { type = "ALL" }, { authenticatedUser }) => {  
            if (!authenticatedUser) {
                throw new Error("Unauthorized");
            }
            return DocumentController.getDocuments(authenticatedUser._id, type.toLowerCase());
        },
    },
    Mutation: {
        createDocument: async (_, { title, docType }, { authenticatedUser }) => {            
            if (!authenticatedUser) {
                throw new Error("Unauthorized");
            }
            return DocumentController.createDocument(authenticatedUser._id, title, docType);
        },
        deleteDocument: async (_, { docId }, { authenticatedUser }) => {            
            if (!authenticatedUser) {
                throw new Error("Unauthorized");
            }
            return DocumentController.deleteDocument(authenticatedUser._id, docId);
        },
        shareDocument: async (_, { docId, shareWithEmail, accessLevel = "reader" }, { authenticatedUser }) => {            
            if (!authenticatedUser) {
                throw new Error("Unauthorized");
            }
            return DocumentController.shareDocument(authenticatedUser._id, docId, shareWithEmail, accessLevel);
        },

        signIn: async (_, { email, password }, { req, res }) => {
            const authController = new AuthController();
            return await authController.loginUser(req, res, email, password);
        },

        signUp: async (_, { email, name }) => {
            const authController = new AuthController();
            return await authController.newUser(name, email);
        }
    }
};


module.exports = { typeDefs, resolvers };