const SILENT_ERROR_NAME = "SilentError";

class SilentError extends Error {
    constructor(message) {
        super(message);
        this.name = SILENT_ERROR_NAME;
    }
}

module.exports = {
    SilentError,
    SILENT_ERROR_NAME
};
