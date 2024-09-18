//const database = require('./mongodb/database.js');
import db from '../mongodb/database.js';

const documents = {
    getAllDocuments: async function getAllDocuments() {
        try {
            const { collection, client } = await db.getCollection("crowd");
        
            const keyObject = await collection.find();
        
            if (keyObject) {
                return res.json({ data: keyObject });
            }
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await client.close();
        }
    },

    getSingleDocument: async function getSingleDocument(id) {
        try {
            const database = await db.getCollection("documents");
        
            const filter = { id: id };
            const keyObject = await database.collection.findOne(filter);
        
            if (keyObject) {
                return res.json({ data: keyObject });
            }
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await database.client.close();
        }
    }

};

export default documents;