import db from '../mongodb/database.js';
import { ObjectId } from 'mongodb';

const documents = {
    getAllDocuments: async function getAllDocuments() {
        try {
            var { collection, client } = await db.getCollection("documents");
            const keyObject = await collection.find().toArray();

            if (keyObject) {
                return keyObject;
            }
        } catch (e) {
            throw new Error('Database find query failed');
        } finally {
            await client.close();
        }
    },

    getSingleDocument: async function getSingleDocument(id) {
        try {
            var { collection, client } = await db.getCollection("documents");
            const keyObject = await collection.findOne(filter);

            if (keyObject) {
                return keyObject;
            }
        } catch (e) {
            throw new Error('Database findOne query failed');
        } finally {
            await client.close();
        }
    },

    createDocument: async function createDocument(user, title, content) {
        try {
            var { collection, client } = await db.getCollection("documents");
            const data = {
                "title": title,
                "previewImage": null,
                "usersWithAccess": [
                    {
                        "name": user.name,
                        "email": user.email,
                        "accessLevel": "Owner"
                    }
                ],
                "content": content,
            };

            await collection.createIndex({ id: 1 });
            const keyObject = await collection.insertOne(data);

            if (keyObject) {
                return keyObject;
            }
        } catch (e) {
            throw new Error('Database insertOne query failed');
        } finally {
            await client.close();
        }
    },

    updateDocument: async function updateDocument(id, updateData) {
        try {
            var { collection, client } = await db.getCollection("documents");
            const filter = { _id: new ObjectId(id) };

            // än sålänge kan man endast uppdatera titel, content och image. lägg till fler
            const update = {
                $set: {
                    ...(updateData.title && { title: updateData.title }),
                    ...(updateData.content && { content: updateData.content }),
                    ...(updateData.previewImage && { previewImage: updateData.previewImage })
                }
            };
            const keyObject = await collection.updateOne(filter, update);

            if (keyObject) {
                return keyObject;
            }
        } catch (e) {
            throw new Error('Database updateOne query failed');
        } finally {
            await client.close();
        }
    },

    deleteDocument: async function deleteDocument(id) {
        try {
            var { collection, client } = await db.getCollection("documents");
            const filter = { _id: new ObjectId(id) };
            const keyObject = await collection.deleteOne(filter);

            if (keyObject) {
                return keyObject;
            }
        } catch (e) {
            throw new Error('Database deleteOne query failed');
        } finally {
            await client.close();
        }
    },
};

export default documents;