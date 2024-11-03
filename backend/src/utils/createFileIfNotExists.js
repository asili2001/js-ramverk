const fs = require('fs').promises;
const path = require('path');

function createFileIfNotExists(filePath, content) {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File does not exist, create it
                fs.writeFile(filePath, content, { flag: 'wx' }, (err) => {
                    if (err) {
                        if (err.code === 'EEXIST') {
                            reject(new Error('File already exists'));
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve('File created successfully!');
                    }
                });
            } else {
                resolve('File already exists');
            }
        });
    });
}

module.exports = { createFileIfNotExists };
