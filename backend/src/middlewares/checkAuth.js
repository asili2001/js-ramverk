const jwt = require("jsonwebtoken");
const returner = require("../utils/returner.js");
const statusCodes = require("../utils/HttpStatusCodes.js");
const User = require("../models/user.model.js");
const cookie = require('cookie');


class AuthMiddleware {

    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET;
    }

    checkUser = async (req, res, next) => {

        const jwtSecret = this.JWT_SECRET;
        const token = req.cookies.key;

        if (!token) return returner(res, "error", statusCodes.UNAUTHORIZED, null, "Unauthorized");

        try {
            const decoded = jwt.verify(token, jwtSecret);

            const currentTime = Math.floor(Date.now() / 1000);

            if (decoded.exp < currentTime) {
                res.clearCookie("key");
                return returner(res, "error", statusCodes.UNAUTHORIZED, [], "Unauthorized");
            }

            const user = await User.findOne({ _id: decoded.userId });

            if (!user) {
                res.clearCookie("key");
                return returner(res, "error", statusCodes.UNAUTHORIZED, [], "Unauthorized");
            }

            res.locals.authenticatedUser = user;

            next();
        } catch (err) {
            res.clearCookie("key");
            console.error("Error in middlewares/checkAuth/checkUser: ", err);
            return returner(res, "error", statusCodes.UNAUTHORIZED, null, "Unauthorized");
        }
    };

    graphQLCheckUser = async (token) => {
        const jwtSecret = process.env.JWT_SECRET;

        if (!token) {
            throw new Error("Unauthorized: No token provided");
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
            const currentTime = Math.floor(Date.now() / 1000);

            if (decoded.exp < currentTime) {
                throw new Error("Unauthorized: Token expired");
            }

            const user = await User.findById(decoded.userId);
            if (!user) {
                throw new Error("Unauthorized: User not found");
            }

            return user; // Return authenticated user
        } catch (error) {
            console.error("Error in checkUser:", error);
            throw new Error("Unauthorized: Invalid token");
        }
    };

    checkSocketUser = async (socket, next) => {
        console.log("checking user auth");

        const cookies = cookie.parse(socket.request.headers.cookie || '');
        const token = cookies.key;

        if (!token) {
            const err = new Error('Unauthorized: No token provided');
            err.data = { content: "Please retry later" };
            return next(err);
        }

        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);
            const currentTime = Math.floor(Date.now() / 1000);

            if (decoded.exp < currentTime) {
                return next(new Error('Unauthorized: Token expired'));
            }

            const user = await User.findOne({ _id: decoded.userId });
            if (!user) {
                return next(new Error('Unauthorized: User not found'));
            }

            // Attach user information to socket for future use
            socket.user = user;
            next();
        } catch (err) {
            console.error("Error in socket authentication: ", err);
            return next(new Error('Unauthorized: Invalid token'));
        }
    };
}

module.exports = AuthMiddleware;
