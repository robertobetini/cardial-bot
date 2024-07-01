const assert = require("assert");

const { test } = require("./testHelper");
const { orderByAttributeComparer, orderByInitiativeComparer, setCombatOrder } = require("../src/utils");
const { calculateAttributeMod } = require("../src/calculators/modCalculator");

const Attributes = require("../src/models/attributes");
const User = require("../src/models/user");

const randomWithRange = (inf, sup) => Math.floor((Math.random() * (sup - inf)) + inf);
createUserWithRandomData = () => {
    const attributes = new Attributes("", "",
        randomWithRange(7, 20),
        randomWithRange(7, 20),
        randomWithRange(7, 20),
        randomWithRange(7, 20),
        randomWithRange(7, 20),
        0,
        true
    );

    const user = new User("", "", "", "", 0, "", "", "", attributes, { baseInitiative: 8 }, null);
    user.skills = null;
    return user;
}

const SIZE = 1000;
const TESTING_MODULE = "Utils";

test(TESTING_MODULE, orderByAttributeComparer,
    () => 
        it("should order by attribute in ascending order", () => {
            const attribute = "DEX";
            const users = [];
            for (let i = 0; i < SIZE; i++) {
                users.push(createUserWithRandomData());
            }

            users.sort((a, b) => orderByAttributeComparer(a, b, attribute, false));
            for (let i = 0; i < SIZE - 1; i++) {
                assert.equal(true, users[i].attributes[attribute] <= users[i + 1].attributes[attribute]);
            }
        }),
    () => 
        it("should order by attribute in descending order", () => {
            const attribute = "DEX";
            const users = [];
            for (let i = 0; i < SIZE; i++) {
                users.push(createUserWithRandomData());
            }

            users.sort((a, b) => orderByAttributeComparer(a, b, attribute, true));
            for (let i = 0; i < SIZE - 1; i++) {
                assert.equal(true, users[i].attributes[attribute] >= users[i + 1].attributes[attribute]);
            }
        })
);

test(TESTING_MODULE, orderByInitiativeComparer,
    () => 
        it("should order by initiative in ascending order", () => {
            const users = [];
            for (let i = 0; i < SIZE; i++) {
                users.push(createUserWithRandomData());
            }

            users.sort((a, b) => orderByInitiativeComparer(a, b, false));
            for (let i = 0; i < SIZE - 1; i++) {
                assert.equal(true, users[i].stats.baseInitiative + calculateAttributeMod(users[i].attributes.DEX) <= users[i + 1].stats.baseInitiative + calculateAttributeMod(users[i + 1].attributes.DEX));
            }
        }),
    () => 
        it("should order by initiative in descending order", () => {
            const users = [];
            for (let i = 0; i < SIZE; i++) {
                users.push(createUserWithRandomData());
            }

            users.sort((a, b) => orderByInitiativeComparer(a, b, true));
            for (let i = 0; i < SIZE - 1; i++) {
                assert.equal(true, users[i].stats.baseInitiative + calculateAttributeMod(users[i].attributes.DEX) >= users[i + 1].stats.baseInitiative + calculateAttributeMod(users[i + 1].attributes.DEX));
            }
        })
);

test(TESTING_MODULE, setCombatOrder,
    () => 
        it("should order by initiative in descending order", () => {
            const users = [];
            for (let i = 0; i < SIZE; i++) {
                users.push(createUserWithRandomData());
            }

            users.sort((a, b) => setCombatOrder(a, b));
            for (let i = 0; i < SIZE - 1; i++) {
                const userInitiative = users[i].stats.baseInitiative + calculateAttributeMod(users[i].attributes.DEX);
                const nextUserInitiative = users[i + 1].stats.baseInitiative + calculateAttributeMod(users[i + 1].attributes.DEX);

                assert.equal(true, userInitiative >= nextUserInitiative, `userInitiative: ${userInitiative}, nextUserInitiative: ${nextUserInitiative}`);
                if (userInitiative === nextUserInitiative) {
                    const userDex = users[i].attributes.DEX;
                    const nextUserDex = users[i + 1].attributes.DEX;

                    assert.equal(true, userDex >= nextUserDex);
                    if (userDex === nextUserDex) {
                        const userStr = users[i].attributes.FOR;
                        const nextUserStr = users[i + 1].attributes.FOR;
                        
                        assert.equal(true, userStr >= nextUserStr);
                    }
                }
            }
        })
);