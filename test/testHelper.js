process.env.DB_NAME = "TEST";
const { init } = require("../src/dbInit");
init();

const buildTestName = (func) => `#${func.name}()`;

const test = (testingModuleName, func, ...its) => {
    describe(testingModuleName, () => {
        describe(buildTestName(func), () => {
            for (let it of its) {
                it();
            };
        })
    });
};

module.exports = {
    buildTestName,
    test
};
