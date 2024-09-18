//const mongo = require("mongodb").MongoClient;
//const config = require("./config.json");

import { MongoClient as mongo} from 'mongodb';

//const collectionName = "crowd";

const database = {
    getCollection: async function getCollection(collectionName) {
        try {
            let dsn = `mongodb://localhost:27017/mumin`;

            if (process.env.NODE_ENV === 'test') {
                dsn = "mongodb://localhost:27017/test";
            }
    
            //const client  = await mongo.connect(dsn, {
            //    useNewUrlParser: true,
            //    useUnifiedTopology: true,
            //});
            const client  = await mongo.connect(dsn);

            const db = await client.db();
            const collection = await db.collection(collectionName);
    
            return {
                collection: collection,
                client: client,
            };
        } catch(error){
            console.log("Error encountered in database.js: ", error);
        }

        //return collection;
    }
};

export default database;