const userMaps = require("./maps/userMaps");

class EDSLInterpreter {
    interpret(commands, entity) {
        for (const command of commands) {
            for (const operation of command.operations) {
                userMaps[command.property][operation.name](entity, operation.getArgsSum());
            }
        }
    }
}

module.exports = EDSLInterpreter;
