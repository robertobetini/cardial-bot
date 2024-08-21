const Logger = require("./logger");
const { unitOfWork } = require("./utils");

module.exports = {
    execute: (script) => {
        const path = `../contingency/scripts/${script}`;
        
        try {
            Logger.info(`Executing script '${path}'`);
            unitOfWork(() => require(path).execute());
        } catch (err) {
            Logger.error(err);
        }

        Logger.info(`Finished script '${path}'`);
    }
};
