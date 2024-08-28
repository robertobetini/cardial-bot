const Token = require("./token");

const DiceService = require("../services/diceService");

class Command {
    constructor(target = null) {
        this.target = target;
        this.property = null;
        this.operations = [];
        this.timeCounters = [];
    }

    setTarget(target) {
        this.target = target;
    }

    setProperty(property) {
        this.property = property;
    }

    addOperation(name, args = []) {
        let operation = this.operations.find(op => op.name === name);
        if (!operation) {
            operation = new Operation(name);
            this.operations.push(operation);
        }

        operation.addArgs(...args);
        return operation;
    }

    addTimeCounter(name, args = []) {
        let counter = this.timeCounters.find(tc => tc.name === name);
        if (!counter) {
            counter = new TimeCounter(name);
            this.timeCounters.push(counter);
        }

        counter.addArgs(...args);
        return counter;
    }
}

class CommandStep {
    constructor(name, args = []) {
        this.name = name;
        this.args = args;
    }

    addArgs(...args) {
        for (const arg of args) {
            const stepArg = new StepArg(arg.value, arg.type);
            this.args.push(stepArg);
        }
    }

    getArgsSum() {
        let sum = 0;

        for (const arg of this.args) {
            switch (arg.type) {
                case Token.NUMBER: 
                    sum += arg.value; 
                    break;
                case Token.DICE_EXPRESSION: 
                    const dice = DiceService.parseDiceString(arg.value);
                    sum += DiceService.roll(dice);
                    break;
                default:
                    throw new Error(`Can't get sum of argument of type ${arg.type}`);
            }
        }

        return sum;
    }
}

class Operation extends CommandStep { }
class TimeCounter extends CommandStep { }

class StepArg {
    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
}

module.exports = { Command, Operation, TimeCounter };
