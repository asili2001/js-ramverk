const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const CryptoHelper = require("../utils/CryptoHelper.js");
const EmailService = require("../utils/EmailService.js");
const bcrypt = require('bcrypt');
const statusCodes = require("../utils/HttpStatusCodes.js");
const returner = require('../utils/returner.js');
const { generateUUID } = require("arias");

/**
 * Controller for users and authentication
*/
class AuthController {

    /**
     * Creates a JWT token with the provided data.
     * @param data Data to be included in the token
     * @returns JWT token
    */

    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.JWT_MAX_AGE = process.env.JWT_MAX_AGE;
        this.FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;
        this.MAIL_SUPPORT_EMAIL = process.env.MAIL_SUPPORT_EMAIL;
    }

    createToken = (data) => {
        if (!this.JWT_SECRET || !this.JWT_MAX_AGE) {
            throw new Error("Missing required environment variables for JWT.");
        }
        return jwt.sign(data, this.JWT_SECRET, {
            expiresIn: parseInt(this.JWT_MAX_AGE)
        });
    }

    /**
     * Handles the creation of new users and sends an activation email.
     * @param {Request} req Request
     * @param {Response} res Response
     */
    newUser = async (req, res) => {
        /**
         * Sends an activation email with a token to the user.
         * @param {string} email The receiver's email
         * @param {string | undefined} token Token from the database
        */
        const sendActivationMail = async (email, token) => {
            const emailService = new EmailService();
            // Send email activation link
            if (!token) {
                token = await User.findOne({ email }).token;
            }

            if (!token) throw new Error("token is undefined");
            const ctyptoHelper = new CryptoHelper();
            const encryptedToken = ctyptoHelper.encrypt(JSON.stringify({ token, email }));
            const activationLink = `${this.FRONTEND_DOMAIN}/activate?t=${encryptedToken}`;

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
                console.error(error);
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
                htmlContent: await emailService.generateAccountActivatedEmail(user.name, this.MAIL_SUPPORT_EMAIL)
            }
            await emailService.sendEmail(user.email, emailData);
            return returner(res, "success", statusCodes.OK, user.toJSON(), "User Has been Activated");
        } catch (error) {
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
        const decryptedToken = JSON.parse(cryptoHelper.decrypt(encryptedToken));
        const excists = await User.exists({ token: decryptedToken.token, email: decryptedToken.email });

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
        if (!this.JWT_MAX_AGE) {
            throw new Error("Missing required environment variables for JWT.");
        }

        try {
            const origin = req.headers.origin;
            console.error(origin);
            let cookieDomain = new URL(origin).hostname;
            cookieDomain = cookieDomain.startsWith('www.') ? cookieDomain.slice(4) : cookieDomain;

            const userData = await User.findOne({ email: req.body.email });

            if (!userData || !userData.isActive) return returner(res, "error", statusCodes.FORBIDDEN, null, "Incorrect email or password");

            const auth = await bcrypt.compare(req.body.password, userData.password);

            if (!auth) return returner(res, "error", statusCodes.FORBIDDEN, null, "Incorrect email or password");

            const token = this.createToken({ userId: userData.id });

            res.cookie("key", token, {
                sameSite: 'strict',
                secure: true,
                path: '/',
                domain: cookieDomain,
                maxAge: parseInt(this.JWT_MAX_AGE) * 1000,
                httpOnly: true,
            });

            console.log(this.FRONTEND_DOMAIN);
            

            res.cookie("role", userData.role[0], {
                sameSite: 'strict',
                secure: true,
                path: '/',
                domain: cookieDomain,
                maxAge: parseInt(this.JWT_MAX_AGE) * 1000,
                httpOnly: false,
            });

            return returner(res, "success", statusCodes.OK, userData.toJSON(), "User Logged In Successfully");
        } catch (error) {
            console.error(error);
            return returner(res, "error", statusCodes.INTERNAL_SERVER_ERROR, null, "Something Went Wrong :(");
        }
    }
}

module.exports = AuthController;
