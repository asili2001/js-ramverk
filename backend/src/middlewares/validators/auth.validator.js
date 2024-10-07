const Joi = require("joi");
const returner = require("../../utils/returner.js");
const statusCodes = require("../../utils/HttpStatusCodes.js");
/**
 * A validator class for the auth controller
 */
class AuthValidator {
    newUser = async (req, res, next) => {
        const body = req.body;

        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required()
        });

        const { error } = schema.validate(body);
    
        if (error) {
            return returner(res, "error", statusCodes.BAD_REQUEST, null, [...error.details][0].message);
        }
        next();
    }

    activateAccount = async (req, res, next) => {
        const schema = Joi.object({
            password: Joi.string().required(),
            token: Joi.string().required()
        });

        const { error } = schema.validate({
            password: req.body.password,
            token: req.body.token
        });
    
        if (error) {
            return returner(res, "error", statusCodes.BAD_REQUEST, null, [...error.details][0].message);
        }
        next();
    }

    loginUser = async (req, res, next) => {
        const body = req.body;

        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        const { error } = schema.validate(body);

        if (error) return returner(res, "error", statusCodes.BAD_REQUEST, null, [...error.details][0].message);

        next();
    }

    validateToken = async (req, res, next) => {
        const body = req.body;

        const schema = Joi.object({
            token: Joi.string().required(),
        });

        const { error } = schema.validate(body);

        if (error) return returner(res, "error", statusCodes.BAD_REQUEST, [], [...error.details][0].message);

        next();
    }
}

module.exports = AuthValidator;
