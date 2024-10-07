const fs = require('fs');
const path = require('path');

// Define the path to the log file
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

module.exports = errorLogger;
