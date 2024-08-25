const assert = require("assert");

const { test } = require("../testHelper");
const { calculateAttributeMod } = require("../../src/calculators/modCalculator");

const StatsService = require("../../src/services/statsService");
const Stats = require("../../src/models/stats");
const Attributes = require("../../src/models/attributes");
const Constants = require("../../src/constants");

const randomBetween = (a, b) => Math.floor(Math.random() * (b - a + 1) + a);
const randomAttributeValue = () => randomBetween(7, 15);

const TESTING_MODULE = "StatsService";
const attributes = [];
for (let i = 0; i < 25; i++) {
    const attribute = new Attributes(
        "1", "11",
        randomAttributeValue(),
        randomAttributeValue(),
        randomAttributeValue(),
        randomAttributeValue(),
        randomAttributeValue(),
        0, false
    );
    attributes.push(attribute);
}

// Mocks
const stats = new Stats("1", "11", 0, 0, 0);
StatsService.get = () => stats;
StatsService.update = () => { return; }

test(TESTING_MODULE, StatsService.setInitialStats,
    () => 
        it("max FP and max SP, base DEF and base initiative should always be constant despite of attributes", () => {
            for (const attribute of attributes) {
                StatsService.setInitialStats(attribute);

                assert.equal(stats.FP.current, Constants.BASE_FP);
                assert.equal(stats.FP.max, Constants.BASE_FP);
                assert.equal(stats.FP.temp, 0);

                assert.equal(stats.SP.current, Constants.BASE_SP);
                assert.equal(stats.SP.max, Constants.BASE_SP);
                assert.equal(stats.SP.temp, 0);

                assert.equal(stats.baseDEF, Constants.BASE_DEF);
                assert.equal(stats.baseInitiative, Constants.BASE_INITIATIVE);
            }
        }),
    () => 
        it("should max HP depend on constitution attribute", () => {
            for (const attribute of attributes) {
                StatsService.setInitialStats(attribute);

                const expectedHP = Constants.BASE_HP + calculateAttributeMod(attribute.CON);
                assert.equal(stats.HP.current, expectedHP);
                assert.equal(stats.HP.max, expectedHP);
                assert.equal(stats.HP.temp, 0);
            }
        })
);
