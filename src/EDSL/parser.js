const Token = require("./token");
const { Command } = require("./command");
const { EDSLSyntaxError, UnexpectedTokenError, ExpectedTokenError } = require("../errors/edslErrors");

const validTokensBeforeDelimiter = [Token.TARGET, Token.PROPERTY, Token.TIME_DELIMITER, Token.CLOSE_PARENTHESIS];
const validTokensBeforeOpenParenthesis = [Token.OPERATION, Token.TIME_COUNTER];
const validTokensBeforeCloseParenthesis = [Token.OPEN_PARENTHESIS, Token.DICE_EXPRESSION, Token.NUMBER, Token.PROFICIENCY_VALUE];

class EDSLParser {
    state = this.getDefaultState();

    *parse(tokens) {
        this.state = this.getDefaultState();

        for (const token of tokens) {
            const { command } = this.state;
            
            if (!command && token.type !== Token.TARGET) {
                throw new EDSLSyntaxError(`first token should be of type ${Token.TARGET}, given '${token.value}' (${token.type})`);
            }

            switch (token.type) {
                case Token.TARGET: this.handleTarget(token); break;
                case Token.DELIMITER: this.handleDelimiter(token); break;
                case Token.LINE_END: yield* this.handleLineEnd(); break;
                case Token.PROPERTY: this.handleProperty(token); break;
                case Token.OPERATION: this.handleOperation(token); break;
                case Token.OPEN_PARENTHESIS: this.handleOpenParenthesis(token); break;
                case Token.CLOSE_PARENTHESIS: this.handleCloseParenthesis(token); break;
                case Token.PROFICIENCY_VALUE: this.handleProficiencyValue(token); break;
                case Token.NUMBER: this.handleNumber(token); break;
                case Token.DICE_EXPRESSION: this.handleDiceExpression(token); break;
                case Token.TIME_DELIMITER: this.handleTimeDelimiter(token); break;
                case Token.TIME_COUNTER: this.handleTimeCounter(token); break;
                case Token.UNKNOWN:
                default: 
                    this.handleUnknown(token);
            }

            this.state.lastToken = token;
        }

        this.ensureFinalStateIsOk();
    }

    handleTarget(token) {
        if (this.state.command) {
            throw UnexpectedTokenError(token);
        }

        this.state.command = new Command(token.value);
        this.state.lineFinished = false;
        this.state.lastToken = token;
    }

    handleDelimiter(token) {
        const { lastToken } = this.state;

        if (!validTokensBeforeDelimiter.includes(lastToken.type)){
            throw new EDSLSyntaxError(`${Token.DELIMITER} can't be used after ${token.type} token (given '${token.value}')`);
        }
    }

    *handleLineEnd() {
        if (this.state.lastToken.type !== Token.CLOSE_PARENTHESIS) {
            throw new EDSLSyntaxError(`line should not end with '${this.state.lastToken.value}' token (${this.state.lastToken.type})`);
        }

        yield this.state.command;
        
        this.state = this.getFinishedState();
    }

    handleProperty(token) {
        const { command, lastToken, timeContext } = this.state;

        if (lastToken.type !== Token.DELIMITER || !command.target || command.property || timeContext) {
            throw new UnexpectedTokenError(token);
        }

        this.state.command.setProperty(token.value);
    }

    handleOperation(token) {
        const { command, lastToken, timeContext } = this.state;

        if (lastToken.type !== Token.DELIMITER || !command.property || timeContext) {
            throw new UnexpectedTokenError(token);
        }

        this.state.currentOperation = this.state.command.addOperation(token.value);
    }

    handleOpenParenthesis(token) {
        const { openContext, lastToken } = this.state;

        if (openContext) {
            throw new UnexpectedTokenError(token);
        } else if (!validTokensBeforeOpenParenthesis.includes(lastToken.type)) {
            throw new EDSLSyntaxError(`token of type ${token.type} should be used after ${validTokensBeforeOpenParenthesis.join(", ")}`);
        }

        this.state.openContext = true;
    }
    
    handleCloseParenthesis(token) {
        const { openContext, lastToken } = this.state;

        if (!openContext) {
            throw new UnexpectedTokenError(token);
        } else if (!validTokensBeforeCloseParenthesis.includes(lastToken.type)) {
            throw new EDSLSyntaxError(`token of type ${token.type} should be used after ${validTokensBeforeCloseParenthesis.join(", ")}`);
        }

        this.state.openContext = false;
    }
    
    handleProficiencyValue(token) {
        const { command, lastToken, timeContext, currentOperation } = this.state; 

        if (lastToken.type !== Token.OPEN_PARENTHESIS || timeContext || currentOperation.name !== "set" || !Token.SKILL_TOKEN_VALUES.includes(command.property)) {
            throw new UnexpectedTokenError(token);
        }

        const arg = { value: token.value, type: token.type };
        currentOperation.addArgs(arg);
    }
    
    handleNumber(token) {
        const { openContext, timeContext, currentTimeCounter, currentOperation } = this.state;

        if (!openContext) {
            throw new UnexpectedTokenError(token);
        }

        const arg = { value: Number(token.value), type: token.type };
        timeContext 
            ? currentTimeCounter.addArgs(arg)
            : currentOperation.addArgs(arg);
    }
    
    handleDiceExpression(token) {
        const { openContext, timeContext, currentTimeCounter, currentOperation } = this.state;

        if (!openContext) {
            throw new UnexpectedTokenError(token);
        }

        const arg = { value: token.value, type: token.type };
        timeContext 
            ? currentTimeCounter.addArgs(arg)
            : currentOperation.addArgs(arg);
    }
    
    handleTimeDelimiter(token) {
        const { lastToken, timeContext } = this.state;

        if (lastToken.type !== Token.DELIMITER || timeContext) {
            throw new UnexpectedTokenError(token);
        }
        
        this.state.timeContext = true;
    }
    
    handleTimeCounter(token) {
        const { lastToken, timeContext } = this.state;

        if (lastToken.type !== Token.DELIMITER || !timeContext) {
            throw new UnexpectedTokenError(token);
        }
     
        this.state.currentTimeCounter = this.state.command.addTimeCounter(token.value);
    }
    
    handleUnknown(token) {
        throw new UnexpectedTokenError(token);
    }

    ensureFinalStateIsOk() {
        const { openContext, lineFinished } = this.state;
        
        if (openContext) {
            throw new ExpectedTokenError({ type: Token.CLOSE_PARENTHESIS, value: ")" });
        }
        if (!lineFinished) {
            throw new EDSLSyntaxError(`missing ${Token.LINE_END} token (';') at the end`);
        }
    }

    getDefaultState() {
        return {
            command: null,
            currentOperation: null,
            currentTimeCounter: null,
            openContext: false,
            lastToken: null,
            lineFinished: false,
            timeContext: false
        };
    }

    getFinishedState() {
        return {
            command: null,
            currentOperation: null,
            currentTimeCounter: null,
            openContext: false,
            lastToken: null,
            lineFinished: true,
            timeContext: false
        }; 
    }
}

module.exports = EDSLParser;
