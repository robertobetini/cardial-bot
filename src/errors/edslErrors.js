class EDSLSyntaxError extends Error {
    constructor(message) {
        super(message);
    }
}

class UnexpectedTokenError extends EDSLSyntaxError {
    constructor(token) {
        super(`unexpected token '${token.value}' (${token.type})`);
    }
}

class ExpectedTokenError extends EDSLSyntaxError {
    constructor(token) {
        super(`expected token '${token.value}' (${token.type})`);
    }
}

module.exports = {
    EDSLSyntaxError,
    UnexpectedTokenError,
    ExpectedTokenError
};
