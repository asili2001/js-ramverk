const Joi = require("joi");
const returner = require("../../utils/returner.js");
const statusCodes = require("../../utils/HttpStatusCodes.js");

class DocumentValidator {
    newDocument = async (req, res, next) => {
        const body = req.body;

        const schema = Joi.object({
            title: Joi.string().required(),
        });

        const { error } = schema.validate(body);
    
        if (error) {
            return returner(res, "error", statusCodes.BAD_REQUEST, null, [...error.details][0].message);
        }
        next();
    }

    updateDocument = async (req, res, next) => {
        const body = req.body;

        const schema = Joi.object({
            title: Joi.string().optional(),
            content: Joi.string().allow('').optional() // for now, we will have it like that. In future we will not have content in the http request. we will instead update the content in data chunks
        });

        const { error } = schema.validate(body);
    
        if (error) {
            return returner(res, "error", statusCodes.BAD_REQUEST, null, [...error.details][0].message);
        }
        next();
    }
}

module.exports = DocumentValidator;
