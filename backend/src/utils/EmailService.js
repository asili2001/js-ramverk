const nodemailer = require('nodemailer');
const { readFile } = require('fs').promises;
const path = require('path');

/**
 * EmailService class for sending emails using Nodemailer.
 */
class EmailService {
    /**
     * Nodemailer transporter instance.
     * @private
     */
    transporter;

    /**
     * Creates an instance of EmailService.
     * Initializes the Nodemailer transporter with email service and authentication.
     */
    constructor() {
        this.MAIL_USER = process.env.MAIL_USER;
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_SECURE,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });
    }

    /**
     * Validates email
     * @param {string} email - The email recipient.
     */
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    /**
     * Sends an email to the specified recipient with the given data.
     * @param {string} to - The email recipient.
     * @param {IMailContent} data - Email content including subject, text, and optional HTML content.
     * @returns {Promise<void>} A Promise that resolves when the email is sent.
     */
    async sendEmail(to, data) {
        if (!this.validateEmail(to)) {
            throw new Error("Wrong email format");
        }
        await this.sendMail(this.transporter, to, data);
    }

    /**
     * Generates an account activation email with a link.
     * @param {string} activationLink - The activation link to include in the email.
     * @returns {Promise<string>} A Promise that resolves with the generated HTML email content.
     */
    async generateAccountActivationEmail(activationLink) {
        const filePath = path.join(__dirname, '../mail_templates/account_activation.html');
        let html = await this.readFile(filePath);

        return html.replace("||ACTIVATION_LINK||", activationLink);
    }

    /**
     * Generates an email indicating that an account has been activated.
     * @param {string} username - The username of the activated account.
     * @param {string} supportEmail - The support email address.
     * @returns {Promise<string>} A Promise that resolves with the generated HTML email content.
     */
    async generateAccountActivatedEmail(username, supportEmail) {
        const filePath = path.join(__dirname, '../mail_templates/account_has_been_activated.html');

        // Read the email template file and replace placeholders
        let html = await this.readFile(filePath);

        html = html.replace("||USERNAME||", username);
        html = html.replace("||SUPPORT_EMAIL||", supportEmail);

        return html;
    }

    /**
     * Sends an email using the provided transporter.
     * @private
     * @param {nodemailer.Transporter} transporter - The Nodemailer transporter instance.
     * @param {string} to - The email recipient.
     * @param {IMailContent} data - Email content including subject, text, and optional HTML content.
     * @returns {Promise<void>} A Promise that resolves when the email is sent.
     */
    async sendMail(transporter, to, data) {
        const mailOptions = {
            from: this.MAIL_USER,
            to: to,
            subject: data.subject,
            text: data.text,
            html: data.htmlContent,
        };

        try {
            // Attempt to send the email and log the result
            await transporter.sendMail(mailOptions);
            
        } catch (error) {
            // Handle errors and throw an exception
            console.error(error);
            throw new Error("Error sending email");
        }
    }

    /**
     * Reads a file asynchronously and returns its content as a string.
     * @private
     * @param {string} filePath - The path to the file to be read.
     * @returns {Promise<string>} A Promise that resolves with the file's content as a string.
     */
    async readFile(filePath) {
        return await readFile(filePath, 'utf-8');
    }
}

module.exports = EmailService;
