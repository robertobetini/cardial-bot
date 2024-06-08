const assert = require("assert");

const { test } = require("../testHelper");
const modCalculator = require("../../src/calculators/modCalculator");

const TESTING_MODULE = "Mod calculator";

test(TESTING_MODULE, modCalculator.calculateAttributeMod,
    () => 
        it("should calculate attribute mod correctly", () => {
            var expected = [
                -5, -5, 
                -4, -4, 
                -3, -3, 
                -2, -2, 
                -1, -1, 
                 0,  0, 
                 1,  1, 
                 2,  2, 
                 3,  3, 
                 4,  4, 
                 5,  5,
                 6,  6,
                 7,  7, 
                 8,  8, 
                 9,  9, 
                 10
                ];
            
            for (let value in expected) {
                const result = modCalculator.calculateAttributeMod(value);
                assert.equal(expected[value], result);
            }
        })
);

test(TESTING_MODULE, modCalculator.calculateProficiencyMod,
    () => 
        it("should calculate proficiency mod correctly", () => {
            var expected = [
                0,
                2, 2, 2, 2,
                3, 3, 3, 3,
                4, 4, 4, 4,
                5, 5, 5, 5, 
                6, 6, 6, 6
            ];
            
            for (let value in expected) {
                const result = modCalculator.calculateProficiencyMod(value);
                assert.equal(expected[value], result);
            }
        })
);
