const Lexer = require("../EDSL/lexer");
const Parser = require("../EDSL/parser");
const Interpreter = require("../EDSL/interpreter");

const lexer = new Lexer();
const parser = new Parser();
const interpreter = new Interpreter();

class EDSLService {
    static eval(code, entity) {
        const tokens = lexer.lex(code);
        const commands = parser.parse(tokens);
        interpreter.interpret(commands, entity);
    }

    static checkSyntax(code) {
        const tokens = lexer.lex(code);
        const commands = parser.parse(tokens);
        try {
            for (const command of commands) {
                continue;
            }
            return {
                success: true,
                error: null
            };
        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    }
}

module.exports = EDSLService;

