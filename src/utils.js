const URL = require("url").URL;

module.exports = {
    randomId: (length) => Math.floor(Math.random() * Math.pow(10, length)).toString(),
    isValidUrl: (urlString) => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    }
};