const buildTestName = (func) => `#${func.name}()`;

const test = (testingModuleName, func, ...its) => {
    describe(testingModuleName, () => {
        describe(buildTestName(func), () => {
            for (let test of its) {
                test();
            };
        })
    });
};

module.exports = {
    buildTestName,
    test
};
