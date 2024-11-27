const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { typeDefs, resolvers } = require("./apollo/schema.js");
const AuthMiddleware = require("./middlewares/checkAuth.js");
const appRoot = require('app-root-path');
const returner = require('./utils/returner.js');
const statusCodes = require("./utils/HttpStatusCodes.js");
const Document = require('./models/document.model.js');
var fs = require('fs');



const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
require('dotenv').config({ path: `${__dirname}/../${envFile}` });

const connectDB = require('./config/db.js');
const userRoutes = require('./routes/user.route.js');
const documentRoutes = require('./routes/document.route.js');

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer })
    ],
});


const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('combined'));


// Connect to the database
connectDB();

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);

const authMiddleware = new AuthMiddleware();
app.get('/api/previews/:documentId', authMiddleware.checkUser, async (req, res) => {
    const user = res.locals.authenticatedUser;

    try {
        // Find the document and check if the user has 'owner' or 'editor' access
        const document = await Document.findOne({
            _id: req.params.documentId,
            "usersWithAccess.user": user._id
        });

        // If no document is found or the user doesn't have the required access
        if (!document) {
            return returner(res, "error", statusCodes.FORBIDDEN, null, "Document not found");
        }
        
        
        const dir = `${appRoot.path}/drafts/${user._id}/${document._id}`;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const imagePath = `${dir}/preview.jpg`;
        

        // Send the image file
        res.sendFile(imagePath, (err) => {
            if (err) {
                res.status(404).send('Image not found');
            }
        });
    } catch (error) {
        console.error(error);
        return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error");
    }
});


(async () => {
    try {
        await server.start();

        app.use(
            expressMiddleware(server, {
                context: async ({ req, res }) => ({
                    req,
                    res,
                    authenticatedUser: await (async () => {
                        const token = req.cookies.key;
                        let authenticatedUser = null;

                        if (token) {
                            authenticatedUser = await authMiddleware.graphQLCheckUser(token).catch((err) => {
                                console.error(err.message);
                                throw new Error("Authentication failed");
                            });
                        }

                        return authenticatedUser;
                    })(),
                }),
            }),
        );

        app.use(
            '/graphql',
            cors({ origin: allowedOrigins, credentials: true }),
            express.json(),
            expressMiddleware(server),
        );

    } catch (e) {
        console.error(e);

    }
})();

// Start the server
httpServer.listen(process.env.API_PORT, () => {
    console.log(`Server listening on port ${process.env.API_PORT}!`);
});
