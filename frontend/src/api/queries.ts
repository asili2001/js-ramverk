import { gql } from '@apollo/client';

const GET_DOCUMENTS = gql`
        query getDocuments($type: DocumentType!) {
                getDocuments(type: $type) {
                        id
                        createdAt
                        title
                        updatedAt
                        usersWithAccess {
                                user {
                                        name
                                        email
                                }
                                accessLevel
                        }
                }
        }
`;

const GET_DOCUMENT = gql`
        query getDocument($docId: ID!) {
                getDocument(docId: $docId) {
                        id
                        content
                        createdAt
                        title
                        updatedAt
                        usersWithAccess {
                                user {
                                        id
                                        email
                                }
                                accessLevel
                                isRequester
                        }
                }
        }
`;
const GET_DOCUMENT_USERS = gql`
        query getDocument($docId: ID!) {
                getDocument(docId: $docId) {
                        usersWithAccess {
                                user {
                                        id
                                        email
                                }
                                accessLevel
                                isRequester
                        }
                }
        }
`;
const CREATE_DOCUMENT = gql`
        mutation createDocument($title: String!) {
                createDocument(title: $title) {
                        id
                }
        }
`;
const DELETE_DOCUMENT = gql`
        mutation deleteDocument($docId: ID!) {
                deleteDocument(docId: $docId)
        }
`;
const SHARE_DOCUMENT = gql`
        mutation shareDocument($docId: ID!, $shareWithEmail: String!, $accessLevel: String!) {
                shareDocument(docId: $docId, shareWithEmail: $shareWithEmail, accessLevel: $accessLevel)
        }
`;

const USER_SIGNIN = gql`
        mutation SignIn($email: String!, $password: String!) {
                signIn(email: $email, password: $password) {
                        id
                }
        }
`;

const USER_SIGNUP = gql`
        mutation SignUp($email: String!, $name: String!) {
                signUp(email: $email, name: $name) {
                        id
                }
        }
`;

export {
        GET_DOCUMENT,
        GET_DOCUMENTS,
        CREATE_DOCUMENT,
        DELETE_DOCUMENT,
        SHARE_DOCUMENT,
        GET_DOCUMENT_USERS,
        USER_SIGNIN,
        USER_SIGNUP,
};