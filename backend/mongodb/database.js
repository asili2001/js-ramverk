const mongo = require("mongodb").MongoClient;
const config = require("./config.json");
//const collectionName = "crowd";

const database = {
    getCollection: async function getCollection (collectionName) {
        let dsn = `mongodb://localhost:27017/mumin`;

        if (process.env.NODE_ENV === 'test') {
            dsn = "mongodb://localhost:27017/test";
        }

        const client  = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = await client.db();
        const collection = await db.collection(collectionName);

        //return {
        //    collection: collection,
        //    client: client,
        //};
        return collection;
    }
};

module.exports = database;