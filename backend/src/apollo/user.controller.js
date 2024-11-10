const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const CryptoHelper = require("../utils/CryptoHelper.js");
const EmailService = require("../utils/EmailService.js");
const bcrypt = require('bcrypt');
const { generateUUID } = require("arias");
const { GraphQLError } = require('graphql');


class MissingEnvVarError extends Error {
    constructor(variable) {
        super(`Missing required environment variable: ${variable}`);
        this.name = 'MissingEnvVarError';
        this.statusCode = 500;
    }
}

/**
 * Controller for users and authentication
*/
class AuthController {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.JWT_MAX_AGE = process.env.JWT_MAX_AGE;
        this.FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;
        this.MAIL_SUPPORT_EMAIL = process.env.MAIL_SUPPORT_EMAIL;
    }
    /**
     * Creates a JWT token with the provided data.
     * @param data Data to be included in the token
     * @returns JWT token
    */
    createToken = (data) => {
        if (!this.JWT_SECRET || !this.JWT_MAX_AGE) {
            throw new MissingEnvVarError('JWT_SECRET or JWT_MAX_AGE');
        }
        return jwt.sign(data, this.JWT_SECRET, {
            expiresIn: parseInt(this.JWT_MAX_AGE)
        });
    }

    /**
     * Handles the creation of new users and sends an activation email.
     * @param {string} name user's name
     * @param {string} email user's email
     */
    newUser = async (name, email) => {
        /**
         * Sends an activation email with a token to the user.
         * @param {string} email The receiver's email
         * @param {string | undefined} token Token from the database
        */
        // Send email activation link
        const sendActivationMail = async (email, token) => {
            const emailService = new EmailService();
            if (!emailService.validateEmail(email)) {
                throw new GraphQLError("Invalid Email Format", {
                    code: 'INVALID_EMAIL',
                    statusCode: 400,
                });
            }
            if (!token) throw new GraphQLError("Token is missing or invalid", {
                code: 'BAD_USER_INPUT',
                statusCode: 400
            });
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

        try {
            if (!name || name.length < 1) {
                throw new GraphQLError("Name cannot be empty", {
                    code: 'NOT_FOUND',
                    statusCode: 404,
                });
            }
            if (!email || email.length < 1) {
                throw new GraphQLError("Email cannot be empty", {
                    code: 'NOT_FOUND',
                    statusCode: 404,
                });
            }
            let user = await User.findOne({ email });
            let activationToken = user?.token;

            if (!user) {
                activationToken = generateUUID();

                const userData = {
                    name: name,
                    email: email,
                    token: activationToken
                }
                user = new User(userData);
                await user.save();
            };

            if (user.isActive) {
                throw new GraphQLError("User with this email already excists", {
                    code: 'USER_ALREADY_EXISTS',
                    statusCode: 400,
                });
            }

            await sendActivationMail(email, activationToken);
            return user.toJSON();
        } catch (error) {
            if (error instanceof GraphQLError) {
                throw error;
            }

            console.error('Error in creating user:', error);
            throw new GraphQLError("Internal server error occurred while creating user.", {
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: 500,
            });
        }
    }

    /**
     * Handles user account activation.
     * @param {string} encryptedToken token
     * @param {string} newPassword the new password
     */
    activateAccount = async (encryptedToken, newPassword) => {
        const cryptoHelper = new CryptoHelper();

        try {
            const decryptedToken = cryptoHelper.decrypt(encryptedToken);
            const { email, token } = JSON.parse(decryptedToken);

            if (!email || !token) {
                throw new GraphQLError("Invalid or missing token data", {
                    code: 'BAD_USER_INPUT',
                    statusCode: 400
                });
            }

            const encryptedPassword = await bcrypt.hash(newPassword, 10);
            let user = await User.findOne({ email, token });
            if (!user) {
                throw new GraphQLError('User not found or token mismatch', {
                    code: 'USER_NOT_FOUND',
                    statusCode: 404,
                });
            };

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
                subject: "Inker | Account Activated",
                text: `Your account has been successfully activated!.`,
                htmlContent: await emailService.generateAccountActivatedEmail(user.name, this.MAIL_SUPPORT_EMAIL)
            }
            await emailService.sendEmail(user.email, emailData);
            return user.toJSON();
        } catch (error) {
            console.error('Error during account activation:', error);
            if (error instanceof GraphQLError) {
                throw error; // Allow known errors to propagate
            }
            throw new GraphQLError("Internal server error occurred during account activation.", {
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: 500,
            });
        }
    }

    /**
     * Checks if token is valid or not.
     * @param {string} encryptedToken token to be validated
     * @returns {boolean} If token is valid
     */
    validateToken = async (encryptedToken) => {
        const cryptoHelper = new CryptoHelper();
        const decryptedToken = JSON.parse(cryptoHelper.decrypt(encryptedToken));
        const excists = await User.exists({ token: decryptedToken.token, email: decryptedToken.email });

        return excists;
    }

    /**
     * Handles user login.
     * @param req Request
     * @param res Response
     */
    loginUser = async (req, res, email, password) => {
        if (!this.JWT_SECRET) {
            throw new MissingEnvVarError('JWT_SECRET');
        }

        if (!email || email.length < 1) {
            throw new GraphQLError("Email cannot be empty", {
                code: 'NOT_FOUND',
                statusCode: 404,
            });
        }

        if (!password || password.length < 1) {
            throw new GraphQLError("Password cannot be empty", {
                code: 'NOT_FOUND',
                statusCode: 404,
            });
        }

        try {
            const origin = req.headers.origin || process.env.FRONTEND_DOMAIN;
            const cookieDomain = new URL(origin).hostname.replace(/^www\./, '');

            const userData = await User.findOne({ email });

            if (!userData || !userData.isActive) {
                throw new GraphQLError('Incorrect email or password or user not active', {
                    code: 'FORBIDDEN',
                    statusCode: 403
                });
            }

            const auth = await bcrypt.compare(password, userData.password);

            if (!auth) {
                throw new GraphQLError('Incorrect email or password', {
                    code: 'FORBIDDEN',
                    statusCode: 403
                });
            }

            const token = this.createToken({ userId: userData.id });

            res.cookie("key", token, {
                sameSite: 'strict',
                secure: true,
                path: '/',
                domain: cookieDomain,
                maxAge: parseInt(this.JWT_MAX_AGE) * 1000,
                httpOnly: true,
            });


            res.cookie("role", userData.role[0], {
                sameSite: 'strict',
                secure: true,
                path: '/',
                domain: cookieDomain,
                maxAge: parseInt(this.JWT_MAX_AGE) * 1000,
                httpOnly: false,
            });

            return userData.toJSON();
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof GraphQLError) {
                throw error;
            }
            throw new GraphQLError("Internal server error occurred during login.", {
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: 500,
            });
        }
    }
}

module.exports = AuthController;
