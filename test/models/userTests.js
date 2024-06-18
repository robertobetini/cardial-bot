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

            stats.currentHP = 10;
            stats.maxHP = 10;

            stats.currentFP = 2;
            stats.maxFP = 2;

            stats.currentSP = 25;
            stats.maxSP = 25;

            user.stats = stats;
            user.attributes = attributes;

            console.log(stats);
            console.log(attributes);
            console.log(user);

            expected = {
                maxHP: 18,
                maxFP: 4,
                maxSP: 25,
                availablePoints: 1
            };
            
            user.levelUp();
            console.log(user);

            assert.equal(expected["maxHP"], user.stats.maxHP);
            assert.equal(expected["maxFP"], user.stats.maxFP);
            assert.equal(expected["maxSP"], user.stats.maxSP);
            assert.equal(expected["availablePoints"], user.attributes.availablePoints);
        })
);
