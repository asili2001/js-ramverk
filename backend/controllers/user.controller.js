import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import CryptoHelper from "../utils/CryptoHelper.js";
import EmailService from "../utils/EmailService.js";
import bcrypt from 'bcrypt';
import statusCodes from "../utils/HttpStatusCodes.js";
import errorLogger from "../utils/errorLogger.js";
import returner from '../utils/returner.js';
import { generateUUID } from "arias";



/**
 * Controller for users and authentication
*/
class AuthController {

    /**
     * Creates a JWT token with the provided data.
     * @param data Data to be included in the token
     * @returns JWT token
    */
    createToken = (data) => {
        if (!process.env.JWT_SECRET || !process.env.JWT_MAX_AGE) {
            throw new Error("Missing required environment variables for JWT.");
        }
        return jwt.sign(data, process.env.JWT_SECRET, {
            expiresIn: parseInt(process.env.JWT_MAX_AGE)
        });
    }

    /**
     * Handles the creation of new users and sends an activation email.
     * @param {Request} req Request
     * @param {Response} res Response
     */
    newUser = async (req, res) => {
        const body = req.body;

        /**
         * Sends an activation email with a token to the user.
         * @param {string} email The receiver's email
         * @param {string | undefined} token Token from the database
        */
        const sendActivationMail = async (email, token) => {
            const emailService = new EmailService();
            // Send email activation link
            if (!token) {
                const token = await User.findOne({ email }).token;
            }

            if (!token) throw new Error("token is undefined");
            const ctyptoHelper = new CryptoHelper();
            const encryptedToken = ctyptoHelper.encrypt(JSON.stringify({ token, email }));
            const activationLink = `${process.env.FRONTEND_DOMAIN}/activate?t=${encryptedToken}`;

            const emailData = {
                subject: "Inker | Account Activation",
                text: `Please go to ${activationLink} to activate your account`,
                htmlContent: await emailService.generateAccountActivationEmail(activationLink),
            }

            await emailService.sendEmail(email, emailData);
        }

        (async () => {
            try {
                let user = await User.findOne({ email: req.body.email });
                let activationToken = user?.token;

                if (!user) {
                    activationToken = generateUUID();

                    const userData = {
                        name: req.body.name,
                        email: req.body.email,
                        token: activationToken
                    }
                    user = new User(userData);
                    await user.save();
                };

                if (user.isActive) return returner(res, "error", statusCodes.FORBIDDEN, null, "User with this email already excists");

                await sendActivationMail(req.body.email, activationToken);
                return returner(res, "success", statusCodes.CREATED, user.toJSON(), "User has been created");
            } catch (error) {
                errorLogger(`${JSON.stringify(error)}|| ${error.message}`);
                return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Something went wrong :(");
            }
        })();
    }

    /**
     * Handles user account activation.
     * @param req Request
     * @param res Response
     */
    activateAccount = async (req, res) => {
        const { token: encryptedToken, password: newPassword } = req.body;
        const cryptoHelper = new CryptoHelper();
        const decryptedToken = cryptoHelper.decrypt(encryptedToken);
        const { email, token } = JSON.parse(decryptedToken);
        const encryptedPassword = await bcrypt.hash(newPassword, 10);

        try {
            let user = await User.findOne({ email, token });
            if (!user) return returner(res, "error", statusCodes.NOT_FOUND, null, "");

            const updatedData = {
                isActive: true,
                token: "",
                password: encryptedPassword,
            }
            user = await User.findByIdAndUpdate(user._id, updatedData, {
                new: true,
                runValidators: true
            });

            const emailService = new EmailService();
            const emailData = {
                subject: "Inker | Account Has Been Activated",
                text: `Account Has Been Activated`,
                htmlContent: await emailService.generateAccountActivatedEmail(user.name, process.env.MAIL_SUPPORT_EMAIL)
            }
            await emailService.sendEmail(user.email, emailData);
            return returner(res, "success", statusCodes.OK, user.toJSON(), "User Has been Activated");
        } catch (error) {
            errorLogger(`${JSON.stringify(error)}|| ${error.message}`);
            return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Something went wrong :(");
        }
    }

    /**
     * Checks if token is valid or not.
     * @param req Request
     * @param res Response
     * @returns If token is valid
     */
    validateToken = async (req, res) => {
        const { token: encryptedToken } = req.body;
        const cryptoHelper = new CryptoHelper();
        const decryptedToken = cryptoHelper.decrypt(encryptedToken);
        const excists = await User.exists({token: decryptedToken});

        if (!excists) {
            return returner(res, "error", statusCodes.FORBIDDEN, null, "Invalid Token");
        }
        
        return returner(res, "success", statusCodes.OK, null, "Valid Token");
    }

    /**
     * Handles user login.
     * @param req Request
     * @param res Response
     */
    loginUser = async (req, res) => {
        const body = req.body;

        if (!process.env.JWT_MAX_AGE) {
            throw new Error("Missing required environment variables for JWT.");
        }

        try {
            const userData = await User.findOne({email: req.body.email});

            if (!userData || !userData.isActive) return returner(res, "error", statusCodes.FORBIDDEN, null, "Incorrect email or password");

            const auth = await bcrypt.compare(req.body.password, userData.password);

            if (!auth) return returner(res, "error", statusCodes.FORBIDDEN, null, "Incorrect email or password");

            const token = this.createToken({ userId: userData.id });

            res.cookie("key", token, {
                sameSite: 'strict',
                secure: true,
                path: '/',
                maxAge: parseInt(process.env.JWT_MAX_AGE) * 1000,
                httpOnly: true, // Cookie is accessible only on the server-side
            });

            res.cookie("role", userData.role[0], {
                sameSite: 'strict',
                secure: true,
                path: '/',
                maxAge: parseInt(process.env.JWT_MAX_AGE) * 1000,
                httpOnly: false,
            });
            
            return returner(res, "success", statusCodes.OK, userData.toJSON(), "User Logged In Successfully");
        } catch (error) {
            errorLogger(`${JSON.stringify(error)}|| ${error.message}`);
            return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Something Went Wrong :(");
        }
    }
}

export default AuthController;
