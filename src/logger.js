const Colors = require("./colors");

const DEBUG_LABEL = `${Colors.LAVENDER}[DEBUG]${Colors.RESET}`;
const INFO_LABEL = `${Colors.GREEN}[INFO]${Colors.RESET}`;
const WARN_LABEL = `${Colors.PENCIL}[WARN]${Colors.RESET}`;
const ERROR_LABEL = `${Colors.RED}[ERROR]${Colors.RESET}`;

class Logger {
    static log = (label, message) => {
        const dateLabel = `${Colors.AQUA}${new Date().toLocaleString()}${Colors.RESET}`;
        console.log(`${dateLabel} ${label} ${message}`);
    }

    static debug = (message) => Logger.log(DEBUG_LABEL, message); 
    static info  = (message) => Logger.log(INFO_LABEL,  message);
    static warn  = (message) => Logger.log(WARN_LABEL,  message);
    static error = (message) => Logger.log(ERROR_LABEL, message);
}

// configure logger based on LOG_LEVEL
const logHandlers = ["debug", "info", "warn", "error"];
const logLevel = process.env.LOG_LEVEL ? Number(process.env.LOG_LEVEL) : 2; // warn by default
for (let i in logHandlers) {
    if (i < logLevel) {
        // override handler to do nothing
        Logger[logHandlers[i]] = () => { return; };
    }
}

module.exports = Logger;
