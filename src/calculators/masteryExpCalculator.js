const ExpCalculator = require("./expCalculator");
const Constants = require("../constants");

const minExpForLevel = [
         0,
         0,
       210,
       630,
     1_890,
     4_550,
     9_800,
    16_100,
    23_800,
    33_600,
    44_800
];

module.exports = new ExpCalculator(minExpForLevel, Constants.MAX_MASTERY);
