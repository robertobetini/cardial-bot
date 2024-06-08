const assert = require("assert");

const { test } = require("../testHelper");
const expCalculator = require("../../src/calculators/expCalculator");
const Constants = require("../../src/constants");

const TESTING_MODULE = "Exp calculator";

test(TESTING_MODULE, expCalculator.getTotalLevelExp,
    () => 
        it("should return minimum total exp to reach the level", () => {
            const minExpsForLevel = [0, 0, 300, 900, 2_700, 6_500];
            for (let i in minExpsForLevel) {
                const exp = expCalculator.getTotalLevelExp(i);
                assert.equal(minExpsForLevel[i], exp);
            }
        }),
    () => 
        it("should return max level exp for level greater than max level", () => {
            const levelsGreaterThanMaxLevel = [Constants.MAX_LEVEL + 1, Constants.MAX_LEVEL + 2, Constants.MAX_LEVEL + 3];
            const maxLevelExp = expCalculator.getTotalLevelExp(Constants.MAX_LEVEL);
            for (let level of levelsGreaterThanMaxLevel) {
                const exp = expCalculator.getTotalLevelExp(level);
                assert.equal(maxLevelExp, exp);
            }
        })
);

test(TESTING_MODULE, expCalculator.getLevelFromExp,
    () => 
        it("should return correct lvl and remaining exp for each totalExp", () => {
            var expectedResults = [
                { totalExp: 0,       lvl: 1,  remainingExp: 0      },
                { totalExp: 299,     lvl: 1,  remainingExp: 299    },
                { totalExp: 300,     lvl: 2,  remainingExp: 0      },
                { totalExp: 301,     lvl: 2,  remainingExp: 1      },
                { totalExp: 899,     lvl: 2,  remainingExp: 599    },
                { totalExp: 900,     lvl: 3,  remainingExp: 0      },
                { totalExp: 901,     lvl: 3,  remainingExp: 1      },
                { totalExp: 100_000, lvl: 12, remainingExp: 0      },
                { totalExp: 110_000, lvl: 12, remainingExp: 10_000 },
                { totalExp: 355_000, lvl: 20, remainingExp: 50_000 },
                { totalExp: 355_001, lvl: 20, remainingExp: 50_000 }
            ];

            for (let expected of expectedResults) {
                const result = expCalculator.getLevelFromExp(expected.totalExp);
                assert.equal(expected.lvl, result.lvl);
                assert.equal(expected.remainingExp, result.remainingExp);
            }
        })
);
