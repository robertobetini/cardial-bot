const assert = require("assert");

const { test } = require("../testHelper");
const EDSLService = require("../../src/services/edslService");

const TESTING_MODULE = "EDSLService";

test(TESTING_MODULE, EDSLService.checkSyntax,
    () => 
        it("should return false for bad syntax", () => {
            const badCodes = [
                "selff.hp.add(1);",
                "self.self.hp.add(1);",
                "self..add(1);",
                "selfhpsub(-1);",
                ".self.hp.add(1);",
                ";self.hp.add(1);",
                "self.hp.mult(1).;",
                "target.hp.add(1).time;",
                "self.hp.add(1).time.;",
                "self.hp.add(1+(5-3));",
                "target.hp.add(1++3);",
                "self.hp.add(1+);",
                "SELF.HP.ADD(1);",
                "Self.Hp.Add(1);",
                "self.fp.sub(5)",
                "self.fp.sub(+);",
                "target.fp.sub(-);",
                "self.fp.sub(d20);",
                "self.fp.sub(1D20);",
                "self.fp.sub(5.);",
                "hp.self.set(2);",
                "target.hp.set(NO_PROF);",
                "target.hp.set(PROF);",
                "target.hp.set(SPEC);",
                "target.acro.set(NO_PROF+PROF);",
            ];

            for (const badCode of badCodes) {
                const result = EDSLService.checkSyntax(badCode);

                assert.equal(result.success, false, badCode);
                assert(result.error);
            }
        }),
    () => 
        it("should return true for good syntax", () => {
            const goodCodes = [
                "self.hp.add(1);",
                "self.hp.add(+1);",
                "self.hp.add(-1);",
                "self.hp.sub(1);",
                "self.hp.mult(1);",
                "self.hp.div(1);",
                "self.hp.set(1);",
                "self.hp.set(1+1);",
                "self.hp.set(1-1);",
                "self.hp.set(+1+1);",
                "self.hp.set(+1-1);",
                "self.hp.set(-1+1);",
                "self.hp.set(-1-1);",
                "self.hp.set(1d20);",
                "self.hp.set(+1d20);",
                "self.hp.set(-1d20);",
                "self.hp.set(1d20+1d10);",
                "self.hp.set(1d20-1d10);",
                "self.hp.set(+1d20+1d10);",
                "self.hp.set(+1d20-1d10);",
                "self.hp.set(-1d20+1d10);",
                "self.hp.set(-1d20-1d10);",
                "self.hp.set(1d20-3);",
                "self.hp.set(1d20+3);",
                "self.hp.set(6+1d20-3);",
                "self.hp.set(6-1d20-3);",
                "self.hp.set(+6-1d20-3);",
                "self.hp.set(-6-1d20-3);",
                "self.atle.set(NO_PROF);",
                "self.atle.set(PROF);",
                "self.atle.set(SPEC);",
                "target.hp.sub(1);",
                "self.maxhp.add(1);",
            ];

            for (const goodCode of goodCodes) {
                const result = EDSLService.checkSyntax(goodCode);

                assert.equal(result.success, true, goodCode);
                assert(!result.error);
            }
        }),
);
