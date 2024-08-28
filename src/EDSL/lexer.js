const Token = require("./token");

const TOKENS = [
    [Token.TARGET, /self|target/],
    [Token.DICE_EXPRESSION, /(?:\+?|-?)(\d+)d(\d+)/],
    [Token.NUMBER, /(\+|-)?\d+(\.\d+)?/], // both integer and float
    [Token.DELIMITER, /\./],
    [Token.OPEN_PARENTHESIS, /\(/],
    [Token.CLOSE_PARENTHESIS, /\)/],
    [Token.LINE_END, /;/],
    [Token.PROPERTY, /for|des|const|con|car|hp|fp|sp|maxhp|maxfp|maxsp|temphp|tempfp|tempsp|exp|gold|slots|expgain|goldgain|acro|ades|atle|enga|furt|inti|intu|inve|natu|perc|perf|pers|pres|sobr|pfor|pdes|pconst|pcon|pcar/],
    [Token.OPERATION, /add|sub|mult|div|set/],
    [Token.TIME_DELIMITER, /time/],
    [Token.TIME_COUNTER, /days|hours|minutes/],
    [Token.PROFICIENCY_VALUE, /NO_PROF|PROF|SPEC/],
    [Token.UNKNOWN, /[^\.\(\);]+/]
];

const PATTERN = new RegExp(TOKENS
    .map(token => `(?<${token[0]}>${token[1].source})`)
    .join("|"), "g"
);

class EDSLLexer {
    *lex(code) {
        if (!code) {
            return;
        }
        const cleanedCode = code.replaceAll(/\s+/g, ""); // Uncle Bob mentioned

        const matches = cleanedCode.matchAll(PATTERN);
        for (const match of matches) {
            const tokenType = Object.keys(match.groups).find(type => match.groups[type]);
            const value = match.groups[tokenType];
            yield new Token(tokenType, value);
        }
    }
}

module.exports = EDSLLexer;
