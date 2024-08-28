const assert = require("assert");

const { test } = require("../testHelper");
const Parser = require("../../src/EDSL/parser");
const Token = require("../../src/EDSL/token");
const { EDSLSyntaxError } = require("../../src/errors/edslErrors");

const allTokenTypes = [
    Token.TARGET,
    Token.DELIMITER,
    Token.OPEN_PARENTHESIS,
    Token.CLOSE_PARENTHESIS,
    Token.LINE_END,
    Token.PROPERTY,
    Token.OPERATION,
    Token.DICE_EXPRESSION,
    Token.TIME_DELIMITER,
    Token.TIME_COUNTER,
    Token.PROFICIENCY_VALUE,
    Token.NUMBER,
    Token.UNKNOWN
];

const T  =  new Token(Token.TARGET            , "self"   );
const D  =  new Token(Token.DELIMITER         , "."      );
const OP =  new Token(Token.OPEN_PARENTHESIS  , "("      );
const CP =  new Token(Token.CLOSE_PARENTHESIS , ")"      );
const L  =  new Token(Token.LINE_END          , ";"      );
const P  =  new Token(Token.PROPERTY          , "hp"     );
const SP =  new Token(Token.PROPERTY          , "acro"   );
const O  =  new Token(Token.OPERATION         , "add"    );
const SO =  new Token(Token.OPERATION         , "set"    );
const DE =  new Token(Token.DICE_EXPRESSION   , "+1d20"  );
const TD =  new Token(Token.TIME_DELIMITER    , "time"   );
const DTC =  new Token(Token.TIME_COUNTER     , "days"   );
const HTC =  new Token(Token.TIME_COUNTER     , "hours"  );
const MTC =  new Token(Token.TIME_COUNTER     , "minutes");
const PV =  new Token(Token.PROFICIENCY_VALUE , "PROF"   );
const NPV = new Token(Token.PROFICIENCY_VALUE , "NO_PROF");
const SPV = new Token(Token.PROFICIENCY_VALUE , "SPEC"   );
const N  =  new Token(Token.NUMBER            , "+10"    );
const U  =  new Token(Token.UNKNOWN           , "%"      );

const assertThrowsOnIteration = (result, error) => {
    assert.throws(() => {
        for (const command of result) {
            continue;
        }
    }, error);
}

const countCommands = (result) => {
    let i = 0;
    for (const command of result) {
        i++;
    }
    return i;
}

const TESTING_MODULE = "Parser";
const parser = new Parser();

test(TESTING_MODULE, Parser.prototype.parse,
    () => 
        it("should throw syntax error if first token isn't of type TARGET", () => {
            const allButTarget = allTokenTypes.filter(type => type !== Token.TARGET);

            for (const tokenType of allButTarget) {  
                const tokens = [new Token(undefined, tokenType)].concat([D, T]);
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should throw syntax error if there are any UNKNOWN token", () => {
            const cases = [
                [ U ],
                [ T, D, U ],
                [ T, U, D, P ],
                [ U, U, U, U ]
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should throw syntax error if DELIMITER is not used after TARGET, PROPERTY, TIME_DELIMITER or CLOSE_PARENTHESIS tokens", () => {
            const cases = [
                [ D ],
                [ T, D, D ],
                [ T, D, P, D, O, D ],
                [ T, D, P, D, O, OP, D ],
                [ T, D, P, D, O, OP, N, D ],
                [ T, D, P, D, O, OP, N, CP, L, D ],
                [ T, D, P, D, O, OP, N, D, N, D, CP ],
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should throw syntax error if token previous to LINE_END is not an CLOSE_PARENTHESIS", () => {
            const cases = [
                [ T, L ],
                [ T, D, L ],
                [ T, D, P, L ],
                [ T, D, P, D, O, L ],
                [ T, D, P, D, O, OP, L ],
                [ T, D, P, D, O, OP, N, L ],
                [ T, D, P, D, O, OP, N, CP, D, TD, L ],
                [ T, D, P, D, O, OP, N, CP, D, TD, D, DTC, L ],
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should throw syntax error if PROPERTY is not connected right after TARGET", () => {
            const cases = [
                [ T, D, TD, P ],
                [ T, D, P, D, P, D, O, OP, N, CP, L  ],
                [ T, D, P, D, O, OP, N, CP, D, TD, D, P, L ]
            ];
            
            for (const tokens of cases) {  
                const result = parser.parse(tokens);
                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should throw syntax error if OPERATION is not connected after PROPERTY or another OPERATION with DELIMITER", () => {
            const cases = [
                [ T, O ],
                [ T, D, O ],
                [ T, D, P, O ],
                [ T, D, P, D, O, O ],
                [ T, D, P, D, O, OP, O ],
                [ T, D, P, D, O, OP, N, O ],
                [ T, D, P, D, O, OP, N, CP, O ],
                [ T, D, P, D, O, OP, N, CP, D, TD, D, O ],
                [ T, D, P, D, O, OP, N, CP, D, TD, D, DTC, D, O ],
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should throw syntax error if OPEN_PARENTHESIS is not connected to OPERATION or TIME_COUNTER", () => {
            const cases = [
                [ T, OP ],
                [ T, D, OP ],
                [ T, D, P, OP ],
                [ T, D, P, D, OP ],
                [ T, D, P, D, O, OP, OP ],
                [ T, D, P, D, O, OP, CP, OP ],
                [ T, D, P, D, O, OP, CP, D, TD, OP ],
                [ T, D, P, D, O, OP, CP, D, TD, D, DTC, OP, OP ],
                [ T, D, P, D, O, OP, CP, D, TD, D, DTC, OP, CP, OP ]
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should throw syntax error if CLOSE_PARENTHESIS is not connected to OPEN_PARENTHESIS, NUMBER, DICE_EXPRESSION OR PROFICIENCY_VALUE", () => {
            const cases = [
                [ T, CP ],
                [ T, D, CP ],
                [ T, D, P, CP ],
                [ T, D, P, D, O, CP ],
                [ T, D, P, D, O, OP, CP, CP ],
                [ T, D, P, D, O, OP, CP, D, TD, CP ],
                [ T, D, P, D, O, OP, CP, D, TD, D, DTC, CP ]
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should throw syntax error if PROFICIENCY_VALUE is connected to an OPERATION that is not 'set'", () => {
            const cases = [
                [ T, D, P, D, new Token(Token.OPERATION, "add"), OP, PV, CP, L ],
                [ T, D, P, D, new Token(Token.OPERATION, "sub"), OP, PV, CP, L ],
                [ T, D, P, D, new Token(Token.OPERATION, "mult"), OP, PV, CP, L ],
                [ T, D, P, D, new Token(Token.OPERATION, "div"), OP, PV, CP, L ],
                [ T, D, P, D, N, new Token(Token.OPERATION, "add"), DE, OP, PV, CP, L ],
                [ T, D, P, D, N, new Token(Token.OPERATION, "sub"), DE, OP, PV, CP, L ],
                [ T, D, P, D, N, new Token(Token.OPERATION, "mult"), DE, OP, PV, CP, L ],
                [ T, D, P, D, N, new Token(Token.OPERATION, "div"), DE, OP, PV, CP, L ],
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should not allow NUMBER outside PARENTHESIS", () => {
            const cases = [
                [ T, D, P, D, O, N ],
                [ T, D, P, D, O, N, OP, CP ],
                [ T, D, P, D, O, OP, CP, N ],
                [ T, D, P, D, O, OP, CP, D, TD, D, DTC, N, OP, CP, L ],
                [ T, D, P, D, O, OP, CP, D, TD, D, DTC, OP, CP, N, L ]
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should not allow DICE_EXPRESSION outside PARENTHESIS", () => {
            const cases = [
                [ T, D, P, D, O, DE ],
                [ T, D, P, D, O, DE, OP, CP ],
                [ T, D, P, D, O, OP, CP, DE ],
                [ T, D, P, D, O, OP, CP, D, TD, D, DTC, DE, OP, CP, L ],
                [ T, D, P, D, O, OP, CP, D, TD, D, DTC, OP, CP, DE, L ]
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                assertThrowsOnIteration(result, EDSLSyntaxError);
            }
        }),
    () => 
        it("should be successful without TIME_COUNTER", () => {
            const cases = [
                [ T, D, P, D, O, OP, CP, L ],
                [ T, D, P, D, O, OP, N, CP, L ],
                [ T, D, P, D, O, OP, N, N, CP, L ],
                [ T, D, P, D, O, OP, DE, CP, L ],
                [ T, D, P, D, O, OP, DE, DE, CP, L ],
                [ T, D, P, D, O, OP, N, DE, CP, L ],
                [ T, D, P, D, O, OP, DE, N, CP, L ],
                [ T, D, SP, D, SO, OP, PV, CP, L ],
                [ T, D, SP, D, SO, OP, NPV, CP, L ],
                [ T, D, SP, D, SO, OP, SPV, CP, L ],
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                const count = countCommands(result);
                assert.equal(count, 1);
            }
        }),
    () => 
        it("should be successful with TIME_COUNTER", () => {
            const defaultCase = [ T, D, P, D, O, OP, CP, D, TD, D ];
            const cases = [
                defaultCase.concat([ DTC, OP, N, CP, L ]),
                defaultCase.concat([ HTC, OP, N, CP, L ]),
                defaultCase.concat([ MTC, OP, N, CP, L ]),
                defaultCase.concat([ DTC, OP, DE, CP, L ]),
                defaultCase.concat([ DTC, OP, N, CP, D, DTC, OP, N, CP, L ]),
                defaultCase.concat([ DTC, OP, N, CP, D, HTC, OP, N, CP, L ]),
                defaultCase.concat([ DTC, OP, N, CP, D, MTC, OP, N, CP, L ]),
                defaultCase.concat([ MTC, OP, N, CP, D, MTC, OP, N, CP, L ]),
                defaultCase.concat([ HTC, OP, N, CP, D, HTC, OP, N, CP, L ]),
                defaultCase.concat([ DTC, OP, N, CP, D, DTC, OP, N, CP, D, DTC, OP, N, CP, L ]),
                defaultCase.concat([ DTC, OP, N, CP, D, HTC, OP, N, CP, D, MTC, OP, N, CP, L ]),
                defaultCase.concat([ MTC, OP, N, CP, D, DTC, OP, N, CP, D, HTC, OP, N, CP, L ]),
                defaultCase.concat([ MTC, OP, N, CP, D, DTC, OP, DE, CP, D, HTC, OP, N, N, DE, DE, N, DE, CP, L ])
            ];

            for (const tokens of cases) {  
                const result = parser.parse(tokens);

                const count = countCommands(result);
                assert.equal(count, 1);
            }
        }),
    () => 
        it("should be successful with multiple lines", () => {
            const lineA = [ T, D, P, D, O, OP, CP, L ];
            const lineB = [ T, D, SP, D, SO, OP, NPV, CP, L];
            const lineC = [ T, D, P, D, O, OP, N, DE, CP, L ];
            const lineD = [ T, D, P, D, O, OP, N, DE, CP, D, TD, D, MTC, OP, N, CP, D, DTC, OP, DE, CP, D, HTC, OP, N, N, DE, DE, N, DE, CP, L ];
            const bigLine = lineA.concat(lineB).concat(lineC).concat(lineD);
            
            const cases = [
                [ lineA.concat(lineA), 2 ],
                [ lineA.concat(lineA).concat(lineA), 3 ],
                [ lineA.concat(lineB).concat(lineC).concat(lineD), 4 ],
                [ lineD.concat(lineC).concat(lineB).concat(lineA), 4 ],
                [ lineD.concat(lineC).concat(lineB).concat(lineA), 4 ],
                [ bigLine.concat(bigLine).concat(bigLine).concat(bigLine), 16 ],
            ];

            for (const $case of cases) {  
                const result = parser.parse($case[0]);

                const count = countCommands(result);
                assert.equal(count, $case[1]);
            }
        }),
);