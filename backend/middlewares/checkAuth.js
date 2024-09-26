import jwt from "jsonwebtoken";
import returner from "../utils/returner.js";
import statusCodes from "../utils/HttpStatusCodes.js";
import User from "../models/user.model.js";

class AuthMiddleware {

    checkUser = async (req, res, next) => {
        
        const jwtSecret = process.env.JWT_SECRET;
        const token = req.cookies.key;
        console.log(jwtSecret);

        if (!token) return returner(res, "error", statusCodes.UNAUTHORIZED, null, "Unauthorized");

        try {
            const decoded = jwt.verify(token, jwtSecret);

            const currentTime = Math.floor(Date.now() / 1000); // in seconds

            // Check if the token is expired
            console.log(decoded.exp);
            
            if (decoded.exp < currentTime) {
                res.clearCookie('key');
                return returner(res, "error", statusCodes.UNAUTHORIZED, [], "Unauthorized");
            }

            const user = await User.findOne({_id: decoded.userId});

            if (!user) {
                return returner(res, "error", statusCodes.UNAUTHORIZED, [], "Unauthorized");
            }

            res.locals.loggedInUser = user;

            next();
        } catch (err) {
            console.error("Error in middlewares/checkAuth/checkUser: ", err);
            return returner(res, "error", statusCodes.UNAUTHORIZED, null, "Unauthorized");
        }
    };
}

export default AuthMiddleware;
