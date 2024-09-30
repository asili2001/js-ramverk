import * as crypto from 'crypto';
import errorLogger from './errorLogger.js';

class CryptoHelper {
    key;
    encryptionIV;

    constructor() {
        // Check if the required environment variables are defined.

        if (!process.env.CRYPTO_SECRET || !process.env.CRYPTO_SECRET_IV) {
            errorLogger("Missing required environment variables for CryptoHelper.");
            throw new Error("Missing required environment variables for CryptoHelper.");
        }

        // Derive a 32-character key from the CRYPTO_SECRET using SHA-512 and an IV from CRYPTO_SECRET_IV.
        this.key = crypto.createHash('sha512').update(process.env.CRYPTO_SECRET).digest('hex').substring(0, 32);
        this.encryptionIV = crypto.createHash('sha512').update(process.env.CRYPTO_SECRET_IV).digest('hex').substring(0, 16);
    }

    /**
     * Encrypts a string using the specified encryption algorithm and secret key.
     *
     * @param {string} data - The data to be encrypted as a UTF-8 encoded string.
     * @returns {string} - The encrypted data as a base64-encoded string.
     * @throws {Error} - If any of the required environment variables are missing.
     */
    encrypt(data) {
        const cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.encryptionIV);
        return Buffer.from(cipher.update(data, 'utf8', 'hex') + cipher.final('hex')).toString('base64'); // Encrypts data and converts to hex and base64
    }

    /**
     * Decrypts a base64-encoded encrypted string using the specified decryption algorithm and secret key.
     *
     * @param {string} encryptedData - The base64-encoded encrypted data to be decrypted.
     * @returns {string} - The decrypted data as a UTF-8 encoded string.
     * @throws {Error} - If any of the required environment variables are missing.
     */
    decrypt(encryptedData) {
        const buff = Buffer.from(encryptedData, 'base64');
        // Converts encrypted data to utf8
        const decipher = crypto.createDecipheriv("aes-256-cbc", this.key, this.encryptionIV);
        try {
            return (
                decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
                decipher.final('utf8')
            ); // Decrypts data and converts to utf8
        } catch (error) {
            errorLogger(`${JSON.stringify(error)}|| ${error.message}`);
            throw new Error("Could not decrypt this data");
        }
    }
}

export default CryptoHelper;
