const assert = require("assert");

const { test } = require("../testHelper");
const DiceService = require("../../src/services/diceService");

const TESTING_MODULE = "DiceService";
const dices = [1, 2, 4, 8, 12, 20, 100];

test(TESTING_MODULE, DiceService.roll,
    () => 
        it("should always roll values between 1 and the dice number", () => {
            for (let d of dices) {
                const dice = { times: 1, dice: d, mod: 0 };
    
                for (let i = 0; i < 100; i++) {
                    const rollResult = DiceService.roll(dice);
                    const value = rollResult.results[0];
                    const isGreaterThanZero = value > 0;
                    const isLessOrEqualThanDiceNumber = value <= dice.dice;
    
                    assert.equal(true, isGreaterThanZero, value);
                    assert.equal(true, isLessOrEqualThanDiceNumber, value);
                }
            }
        }),
    () => 
        it("should apply mod when it is not zero", () => {
            for (let mod = 0; mod < 100; mod++) {
                const dice = { times: 1, dice: 0, mod };
                const rollResult = DiceService.roll(dice);
                const value = rollResult.results[0];

                assert.equal(mod, value);
                assert.equal(mod, value);
            }
        }),
    () => 
        it("should roll the number of times indicated within dice object", () => {
            for (let times = 1; times <= 100; times++) {
                const dice = { times, dice: 10, mod: 0 };
                const rollResult = DiceService.roll(dice);

                const allResultsAreNotNull = rollResult.results.every(result => result);
                assert.equal(times, rollResult.results.length);
                assert.equal(true, allResultsAreNotNull);
            }
        }),
);
