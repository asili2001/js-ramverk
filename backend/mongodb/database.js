//const mongo = require("mongodb").MongoClient;
//const config = require("./config.json");

import { MongoClient as mongo} from 'mongodb';

//const collectionName = "crowd";

const database = {

    initializeDatabase: async function initializeDatabase() {
        let client;
        try {
            const { collection, client } = await this.getCollection("documents");

            // nedan 2 rader kan vara användbar för att fixa unique identifier för ngt,
            // ex ifall man ofta söker efter email
            //const { collection, client } = await this.getCollection("users");
            //await collection.createIndex({ email: 1 });

            /*
            const schema = {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["title", "usersWithAccess", "content"],
                    properties: {
                        title: { bsonType: "string" },
                        usersWithAccess: {
                            bsonType: "array",
                            items: {
                                bsonType: "object",
                                required: ["id", "name", "email", "accessLevel"],
                                properties: {
                                    id: { bsonType: "string" }, // <-- skapa separat collection för users
                                    name: { bsonType: "string" },
                                    email: { bsonType: "string" },
                                    accessLevel: { bsonType: "string" }
                                }
                            }
                        },
                        content: { bsonType: "string" }
                    }
                }
            };
            */

            const schema = {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["title", "usersWithAccess"],
                    properties: {
                        title: { bsonType: "string" },
                        previewImage: { bsonType: ["null", "string", "object"] },
                        usersWithAccess: {
                            bsonType: "array",
                            items: {
                                bsonType: "object",
                                required: ["_id", "accessLevel"],
                                properties: {
                                    _id: { bsonType: "objectId" },
                                    accessLevel: { bsonType: "string" }
                                }
                            }
                        },
                        content: { bsonType: ["null", "string"] }
                    }
                }
            };

            const db = client.db();
            const collections = await db.listCollections({ name: "documents" }).toArray();

            //await db.dropCollection("documents");// to reset the collection
            if (collections.length == 0) {
                await db.createCollection("documents", { validator: schema });
                console.log('Collection blueprint created with schema validation');
            }

        } catch (e) {
            console.error('Error creating collection or index:', e.message);
        } finally {
            if (client) {
                await client.close();
            }
        }
    },

    getCollection: async function getCollection(collectionName) {
        try {
            let dsn = `mongodb://localhost:27017/editor`;

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