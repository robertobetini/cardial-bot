const assert = require("assert");

const { test } = require("./testHelper");
const { orderByAttributeComparer, orderByInitiativeComparer, setCombatOrder, isValidUrl } = require("../src/utils");
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
                        const userStr = users[i].attributes.STR;
                        const nextUserStr = users[i + 1].attributes.STR;
                        
                        assert.equal(true, userStr >= nextUserStr);
                    }
                }
            }
        })
);

test(TESTING_MODULE, isValidUrl,
    () => 
        it("should return false if url is null, undefined or empty string", () => {
            const invalidUrls = [ null, undefined, "", " " ];
            for (const invalidUrl of invalidUrls) {
                const result = isValidUrl(invalidUrl);

                assert.equal(result, false, invalidUrl);
            }
        }),
    () => 
        it("should return false if url is local path", () => {
            const localPaths = [ "C:\\img.png", "C:\\Users\\Documents\\img.png", "~/img.png" ];
            for (const path of localPaths) {
                const result = isValidUrl(path);

                assert.equal(result, false, path);
            }
        }),
    () => 
        it("should return false if url uses other protocols", () => {
            const invalidUrls = [ "file:///img.png" ];
            for (const invalidUrl of invalidUrls) {
                const result = isValidUrl(invalidUrl);

                assert.equal(result, false, invalidUrl);
            }
        }),
    () => 
        it("should return false if url is malformed http or https url", () => {
            const httpAndHttpsUrls = [ 
                "http:/www.test.com", 
                "https:/www.test.com", 
                // "http:///www.test.com", -> TODO: return false when theres is more than 2 '/'
                // "https:///www.test.com" -> TODO: return false when theres is more than 2 '/'
            ];
            for (const url of httpAndHttpsUrls) {
                const result = isValidUrl(url);

                assert.equal(result, false, url);
            }
        }),
    () => 
        it("should return true if url is well formed http or https url", () => {
            const httpAndHttpsUrls = [ 
                "http://www.test.com", 
                "https://www.test.com", 
                "http://www.test.com/files/img.png", 
                "https://www.test.com/files/img.png", 
                "http://www.test.com/files/imgs?id=123",
                "https://www.test.com/files/imgs?id=123"
            ];
            for (const url of httpAndHttpsUrls) {
                const result = isValidUrl(url);

                assert.equal(result, true, url);
            }
        }),
);
