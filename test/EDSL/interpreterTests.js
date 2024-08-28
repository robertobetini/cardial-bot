const assert = require("assert");

const { test } = require("../testHelper");
const Interpreter = require("../../src/EDSL/interpreter");
const { Command } = require("../../src/EDSL/command");
const User = require("../../src/models/user");
const Token = require("../../src/EDSL/token");

const TESTING_MODULE = "Interpreter";
const interpreter = new Interpreter();

test(TESTING_MODULE, Interpreter.prototype.interpret,
    () => 
        it("should apply add operation successfully", () => {
            const user = new User(null, null, null, null);
            const hpToAdd = 10;
            const expected = user.stats.HP.max + hpToAdd;

            const command = new Command("self");
            command.setProperty("maxhp");
            command
                .addOperation("add")
                .addArgs({ value: hpToAdd, type: Token.NUMBER });

            interpreter.interpret([command], user);

            assert.equal(user.stats.HP.max, expected);
        })
    //TODO: test other operations
);