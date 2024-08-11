const assert = require("assert");

const { test } = require("../testHelper");

const User = require("../../src/models/user");
const Stats = require("../../src/models/stats");
const Attributes = require("../../src/models/attributes");

const TESTING_MODULE = "User";

test(TESTING_MODULE, Stats.prototype.tryUpdateGold,
    () => 
        it("should apply correct stats and attributes update", () => {
            const user = new User(null, null, null, null, null, null, null, null, null, null);
            const stats = new Stats(null, null, 0, 0);
            const attributes = new Attributes(null, null, 15, 15, 15, 15, 15, 0, true);

            stats.HP.current = 10;
            stats.HP.max = 10;

            stats.FP.current = 2;
            stats.FP.max = 2;

            stats.SP.current = 25;
            stats.SP.max = 25;

            user.stats = stats;
            user.attributes = attributes;

            expected = {
                maxHP: 18,
                maxFP: 4,
                maxSP: 25,
                availablePoints: 1
            };
            
            user.levelUp();

            assert.equal(expected["maxHP"], user.stats.HP.max);
            assert.equal(expected["maxFP"], user.stats.FP.max);
            assert.equal(expected["maxSP"], user.stats.SP.max);
            assert.equal(expected["availablePoints"], user.attributes.availablePoints);
        })
);
