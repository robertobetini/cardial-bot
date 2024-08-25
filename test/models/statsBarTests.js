const assert = require("assert");

const { test } = require("../testHelper");
const StatsBar = require("../../src/models/statsBar");

const TESTING_MODULE = "StatsBar";

test(TESTING_MODULE, StatsBar.prototype.set,
    () => 
        it("should constrain current value greater or equal than 0", () => {
            var statsBar = new StatsBar("test", 10, 10, 0);
            statsBar.set(-1, 10, 0);
            
            assert.equal(statsBar.current, 0);
        }),
    () => 
        it("should constrain max value greater or equal than 0", () => {
            var statsBar = new StatsBar("test", 10, 10, 0);
            statsBar.set(10, -10, 0);
            
            assert.equal(statsBar.max, 0);
        }),
    () => 
        it("should constrain temp value greater or equal than 0", () => {
            var statsBar = new StatsBar("test", 10, 10, 0);
            statsBar.set(10, 10, -10);
            
            assert.equal(statsBar.temp, 0);
        }),
    () => 
        it("should constrain current value less than or equal max value", () => {
            var statsBar = new StatsBar("test", 10, 10, 0);
            statsBar.set(200, 20, 0);
            
            assert.equal(statsBar.current, statsBar.max);
        }),
);

test(TESTING_MODULE, StatsBar.prototype.increaseCurrent,
    () => 
        it("should constrain current value greater or equal than 0", () => {
            var statsBar = new StatsBar("test", 5, 10, 0);
            statsBar.increaseCurrent(-100);
            
            assert.equal(statsBar.current, 0);
        }),
    () => 
        it("should constrain current value less than or equal max value", () => {
            var statsBar = new StatsBar("test", 5, 10, 0);
            statsBar.increaseCurrent(100);
            
            assert.equal(statsBar.current, statsBar.max);
        }),
);

test(TESTING_MODULE, StatsBar.prototype.increaseMax,
    () => 
        it("should constrain current value less than or equal max value", () => {
            var statsBar = new StatsBar("test", 10, 10, 0);
            statsBar.increaseMax(-100);
            
            assert.equal(statsBar.max, 0);
        }),
);

test(TESTING_MODULE, StatsBar.prototype.increaseTemp,
    () => 
        it("should constrain current value greater or equal than 0", () => {
            var statsBar = new StatsBar("test", 10, 10, 10);
            statsBar.increaseTemp(-100);
            
            assert.equal(statsBar.temp, 0);
        })
);
