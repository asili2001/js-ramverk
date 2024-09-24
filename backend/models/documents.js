import db from '../mongodb/database.js';
import { ObjectId } from 'mongodb';

const documents = {
    getAllDocuments: async function getAllDocuments() {
        try {
            var { collection, client } = await db.getCollection("documents");
            const dbResponse = await collection.find().toArray();

            if (dbResponse) {
                return dbResponse;
            }
        } catch (e) {
            throw new Error(`Database find query failed, ${e.message}`);
        } finally {
            await client.close();
        }
    },

    getSingleDocument: async function getSingleDocument(id) {
        try {
            const filter = { _id: new ObjectId(id) };

            var { collection, client } = await db.getCollection("documents");
            const dbResponse = await collection.findOne(filter);

            if (dbResponse) {
                return dbResponse;
            }
        } catch (e) {
            throw new Error(`Database findOne query failed, ${e.message}`);
        } finally {
            await client.close();
        }
    },

    createDocument: async function createDocument(title) {
        // users id should be passed as parameter, when we actually have users
        try {
            var { collection, client } = await db.getCollection("documents");
            const data = {
                "title": title,
                "previewImage": null,
                "usersWithAccess": [
                    {
                        "_id": new ObjectId(), // change objectId for the user
                        "accessLevel": "owner"
                    }
                ],
                "content": null
            };

            //await collection.createIndex({ id: 1 });
            const dbResponse = await collection.insertOne(data);

            if (dbResponse) {
                return dbResponse;
            }
        } catch (e) {
            throw new Error(`Database insertOne query failed, ${e.message}`);
        } finally {
            await client.close();
        }
    },

    updateDocument: async function updateDocument(id, updateData) {
        try {
            var { collection, client } = await db.getCollection("documents");
            const filter = { _id: new ObjectId(id) };

            const update = {
                $set: {
                    ...(updateData.title && { title: updateData.title }),
                    ...(updateData.content && { content: updateData.content }),
                    ...(updateData.previewImage && { previewImage: updateData.previewImage })
                }
            };
            const dbResponse = await collection.updateOne(filter, update);

            if (dbResponse) {
                return dbResponse;
            }
        } catch (e) {
            throw new Error(`Database updateOne query failed, ${e.message}`);
        } finally {
            await client.close();
        }
    },

    deleteDocument: async function deleteDocument(id) {
        try {
            var { collection, client } = await db.getCollection("documents");
            const filter = { _id: new ObjectId(id) };
            const dbResponse = await collection.deleteOne(filter);

            if (dbResponse) {
                return dbResponse;
            }
        } catch (e) {
            throw new Error(`Database deleteOne query failed, ${e.message}`);
        } finally {
            await client.close();
        }
    },
};

export default documents;