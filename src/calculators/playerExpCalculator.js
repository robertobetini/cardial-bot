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
     64_000,
     85_000,
    100_000,
    120_000,
    140_000,
    165_000,
    195_000,
    225_000,
    265_000,
    305_000,
    355_000
];

module.exports = new ExpCalculator(minExpForLevel, Constants.MAX_LEVEL);
