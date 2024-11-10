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

const authMiddleware = new AuthMiddleware();

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



(async () => {
    try {
        await server.start();

        app.use(
            // A named context function is required if you are not
            // using ApolloServer<BaseContext>
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
