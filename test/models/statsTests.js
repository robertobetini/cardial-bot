const assert = require("assert");

const { test } = require("../testHelper");
const Stats = require("../../src/models/stats");

const TESTING_MODULE = "Stats";

test(TESTING_MODULE, Stats.prototype.tryUpdateGold,
    () => 
        it("should prevent negative gold", () => {
            const stats = new Stats(null, null, 0, 100);
            
            assert.throws(() => stats.tryUpdateGold(-1_000_000), "O usuário não possui saldo para suficiente para ser removido");
        }),
    () => 
        it("should always increase gold for any positive amount", () => {
            for (let gold = 0; gold < 10_000; gold += 1_000) {
                const stats = new Stats(null, null, 0, 0);
                stats.tryUpdateGold(gold);

                assert.equal(gold, stats.gold);
            }
        }),
);
