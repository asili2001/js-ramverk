const database = require('./mongodb/database.js');

const documents = {
    getAllDocuments: async function getAllDocuments() {
        try {
            db = await database.getCollection("documents");
        
            const keyObject = await db.collection.find();
        
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
            await db.client.close();
        }
    },

    getSingleDocument: async function getSingleDocument(email) {
        try {
            db = await database.getCollection("documents");
        
            const filter = { email: email };
            const keyObject = await db.collection.findOne(filter);
        
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
            await db.client.close();
        }
    }

};

module.exports = orders;