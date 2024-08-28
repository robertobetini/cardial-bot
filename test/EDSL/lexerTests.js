const assert = require("assert");

const { test } = require("../testHelper");
const Lexer = require("../../src/EDSL/lexer");
const Token = require("../../src/EDSL/token");

const countTokens = (tokensGenerator, tokenType) => {
    let i = 0;
    for (const token of tokensGenerator) {
        if (token.type === tokenType) {
            i++;
        }
    }
    return i;
}

const assertInOrder = (tokensGenerator, tokenType, $case) => {
    const expectedCount = $case.expected.length;
    let i = 0;
    for (const token of tokensGenerator) {
        if (token.type === tokenType) {
            assert.equal(token.value, $case.expected[i++], $case.code);
        }
    }

    assert.equal(i, expectedCount);
}

const TESTING_MODULE = "Lexer";
const lexer = new Lexer();

test(TESTING_MODULE, Lexer.prototype.lex,
    () => 
        it("should return empty token list if code is null, empty or whitespace", () => {
            const nullEmptyOrWhiteSpaceCode = [ null, undefined, "", " \n\t\r" ];
            for (const code of nullEmptyOrWhiteSpaceCode) {
                const result = lexer.lex(code);
                for (const token of result) {
                    assert.fail();
                }
            }
        }),
    () => 
        it("should identify UNKNOWN tokens", () => {
            const code = "self.UNKNOWN.p%.timeJRKL~(io);";
            const expected = [ "UNKNOWN", "p%", "JRKL~", "io" ];
            const result = lexer.lex(code);

            assertInOrder(result, Token.UNKNOWN, { code, expected });
        }),
    () => 
        it("should identify TARGET tokens", () => {
            const cases = [
                { code: "self.hp.add(10);", expected: [ "self" ] },
                { code: "target.hp.add(10);", expected: [ "target" ] },
                { code: "self.target.add(10);", expected: [ "self", "target" ] },
                { code: "target.self.add(10);", expected: [ "target", "self" ] },
                { code: "selfselftargettarget;", expected: [ "self", "self", "target", "target" ] },
                { code: "targetselftarget;", expected: [ "target", "self", "target" ] },
                { code: ".self....;NO_PROFselfhptargethp.add(10);", expected: [ "self", "self", "target" ] }
            ];
            for (const $case of cases) {
                const result = lexer.lex($case.code);

                assertInOrder(result, Token.TARGET, $case);
            }
        }),
    () => 
        it("should identify DELIMITER tokens", () => {
            const cases = [
                { code: "self.hp.add(10).time.days(1);", expected: 4 },
                { code: "target..hp..add(10);", expected: 4 },
                { code: "UNKNOWN.UNKNOWN.add(10);", expected: 2 },
                { code: "...", expected: 3 },
                { code: "...;", expected: 3 },
                { code: ".,.;.?.;NO_PROF.selfhptargethp.add(10);", expected: 6 }
            ];
            for (const $case of cases) {
                const { code, expected } = $case;
                const result = lexer.lex(code);
                const actual = countTokens(result, Token.DELIMITER);

                assert.equal(actual, expected);
            }
        }),
    () => 
        it("should identify LINE_END tokens", () => {
            const cases = [
                { code: "self.hp.add(10).time.days(1);", expected: 1 },
                { code: "target.;", expected: 1 },
                { code: ";;;", expected: 3 },
                { code: "self.hp.add(1);target.hp.add(2);", expected: 2 },
                { code: ";.;", expected: 2 }
            ];
            for (const $case of cases) {
                const { code, expected } = $case;
                const result = lexer.lex(code);
                const actual = countTokens(result, Token.LINE_END);

                assert.equal(actual, expected);
            }
        }),
    () => 
        it("should identify OPEN_PARENTHESIS tokens", () => {
            const cases = [
                { code: "self.hp.add(10).time.days(1);", expected: 2 },
                { code: "target.()()(((;", expected: 5 },
                { code: "(((", expected: 3 },
                { code: "JKRKJRLL()", expected: 1 }
            ];
            for (const $case of cases) {
                const { code, expected } = $case;
                const result = lexer.lex(code);
                const actual = countTokens(result, Token.OPEN_PARENTHESIS);

                assert.equal(actual, expected);
            }
        }),
    () => 
        it("should identify CLOSE_PARENTHESIS tokens", () => {
            const cases = [
                { code: "self.hp.add(10).time.days(1);", expected: 2 },
                { code: "target.()())));", expected: 5 },
                { code: ")))", expected: 3 },
                { code: "JKRKJRLL()", expected: 1 }
            ];
            for (const $case of cases) {
                const { code, expected } = $case;
                const result = lexer.lex(code);
                const actual = countTokens(result, Token.CLOSE_PARENTHESIS);

                assert.equal(actual, expected);
            }
        }),
    () => 
        it("should identify TIME_DELIMITER tokens", () => {
            const cases = [
                { code: "self.hp.add(10).time.days(1);", expected: 1 },
                { code: "time.()())));", expected: 1 },
                { code: "))time).time;", expected: 2 },
                { code: "timetimeTIMETIME", expected: 2 }
            ];
            for (const $case of cases) {
                const { code, expected } = $case;
                const result = lexer.lex(code);
                const actual = countTokens(result, Token.TIME_DELIMITER);

                assert.equal(actual, expected);
            }
        }),
    () => 
        it("should identify PROFICIENCY_VALUE tokens", () => {
            const cases = [
                { code: "self.atle.set(NO_PROF);self.acro.set(SPEC);self.intu.set(PROF)", expected: [ "NO_PROF", "SPEC", "PROF" ] },
                { code: "NO_PROFSPECPROF", expected: [ "NO_PROF", "SPEC", "PROF" ] },
                { code: "PROFNO_PROFSPEC", expected: [ "PROF", "NO_PROF", "SPEC"] }
            ];
            for (const $case of cases) {
                const result = lexer.lex($case.code);
                
                assertInOrder(result, Token.PROFICIENCY_VALUE, $case);
            }
        }),
    () => 
        it("should identify TIME_COUNTER tokens", () => {
            const cases = [
                { code: "self.hp.add(1).time.days(2).hours(5).minutes(10);", expected: [ "days", "hours", "minutes" ] },
                { code: "self.hp.add(1).time.hours(2).days(5).minutes(10);", expected: [ "hours", "days", "minutes" ] },
                { code: "self.hp.add(1).time.minutes(2).hours(5).days(10);", expected: [ "minutes", "hours", "days" ] },
                { code: "self.hp.add(1).time.days(2).days(5).hours(10).hours(5).minutes(1).minutes(7);", expected: [ "days", "days", "hours", "hours", "minutes", "minutes" ] }
            ];
            for (const $case of cases) {
                const result = lexer.lex($case.code);
                
                assertInOrder(result, Token.TIME_COUNTER, $case);
            }
        }),
    () => 
        it("should identify integer NUMBER tokens", () => {
            const cases = [
                { code: "self.hp.add(1).time.days(2).hours(5).minutes(10);", expected: [ "1", "2", "5", "10" ] },
                { code: "self.hp.add(-1).time.hours(-2).days(-5).minutes(-10);", expected: [ "-1", "-2", "-5", "-10" ] },
                { code: "self.hp.add(1+6).time.minutes(-2-5).hours(50).days(10 + 10 + 10);", expected: [ "1", "+6", "-2", "-5", "50", "10", "+10", "+10" ] }
            ];
            for (const $case of cases) {
                const result = lexer.lex($case.code);
                
                assertInOrder(result, Token.NUMBER, $case);
            }
        }),
    () => 
        it("should identify float NUMBER tokens", () => {
            const cases = [
                { code: "self.hp.add(1.0).time.days(2.5).hours(5.5).minutes(10.1);", expected: [ "1.0", "2.5", "5.5", "10.1" ] },
                { code: "self.hp.add(-1.0).time.hours(-2.5).days(-5.5).minutes(-10.1);", expected: [ "-1.0", "-2.5", "-5.5", "-10.1" ] },
                { code: "self.hp.add(1.6+6.4).time.minutes(-2.5-5.9).hours(50.51).days(10.16 + 10.25 + 10.200);", expected: [ "1.6", "+6.4", "-2.5", "-5.9", "50.51", "10.16", "+10.25", "+10.200" ] }
            ];
            for (const $case of cases) {
                const result = lexer.lex($case.code);
                
                assertInOrder(result, Token.NUMBER, $case);
            }
        }),
    () => 
        it("should identify OPERATION tokens", () => {
            const cases = [
                { code: "self.hp.add(1).sub(5).mult(2).div(4);", expected: [ "add", "sub", "mult", "div" ] },
                { code: "self.hp.add(1+1).add(2).add(10);", expected: [ "add", "add", "add" ] },
                { code: "self.hp.set(1+6);self.fp.set(2)", expected: [ "set", "set" ] },
                { code: "self.atle.set(NO_PROF);self.acro.set(SPEC);self.intu.SET(PROF)", expected: [ "set", "set" ] }
            ];
            for (const $case of cases) {
                const result = lexer.lex($case.code);
                
                assertInOrder(result, Token.OPERATION, $case);
            }
        }),
    () => 
        it("should identify DICE_EXPRESSION tokens", () => {
            const cases = [
                { code: "self.hp.add(1d20).time.days(1d2).hours(1d6).minutes(1d10);", expected: [ "1d20", "1d2", "1d6", "1d10" ] },
                { code: "self.hp.add(1d20+3).time.hours(2d6).days(2d4+3d6-5).minutes(d6);", expected: [ "1d20", "2d6", "2d4", "+3d6" ] }
            ];
            for (const $case of cases) {
                const result = lexer.lex($case.code);
                
                assertInOrder(result, Token.DICE_EXPRESSION, $case);
            }
        }),
    // TODO: property
);
