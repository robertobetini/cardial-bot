const ExpCalculator = require("./expCalculator");
const Constants = require("../constants");

const minExpForLevel = [
        0,
        0,
      300,
      900,
    2_700,
    6_500,
   14_000,
   23_000,
   34_000,
   48_000,
   64_000
];

module.exports = new ExpCalculator(minExpForLevel, Constants.MAX_MASTERY);
