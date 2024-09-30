import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define the path to the log file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, '../errorLogger.log');

const errorLogger = (message) => {
    const error = new Error();
    const callerInfo = error.stack?.split('\n')[2].trim(); // Get caller info from the call stack

    if (callerInfo) {
        const logMessage = `${new Date().toISOString()}: [${callerInfo}] ${message}\n`;

        if (process.env.NODE_ENV === "development") {
            console.error(logMessage);
            return;
        }

        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });
    } else {
        console.error('Error determining caller info.');
    }
};

export default errorLogger;
