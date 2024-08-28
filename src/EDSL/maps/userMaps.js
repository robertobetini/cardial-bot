const skillsValuesMap = require("./skillsValuesMap");

module.exports = {
    for: {
        set:  (user, val) => user.attributes.FOR = Math.floor(val),
        add:  (user, val) => user.attributes.FOR += Math.floor(val),
        sub:  (user, val) => user.attributes.FOR -= Math.floor(val),
        mult: (user, val) => user.attributes.FOR *= Math.floor(val),
        div:  (user, val) => user.attributes.FOR = Math.floor(user.attributes.FOR / val)
    },
    des: {
        set:  (user, val) => user.attributes.DEX = Math.floor(val),
        add:  (user, val) => user.attributes.DEX += Math.floor(val),
        sub:  (user, val) => user.attributes.DEX -= Math.floor(val),
        mult: (user, val) => user.attributes.DEX *= Math.floor(val),
        div:  (user, val) => user.attributes.DEX = Math.floor(user.attributes.DEX / val)
    },
    const: {
        set:  (user, val) => user.attributes.CON = Math.floor(val),
        add:  (user, val) => user.attributes.CON += Math.floor(val),
        sub:  (user, val) => user.attributes.CON -= Math.floor(val),
        mult: (user, val) => user.attributes.CON *= Math.floor(val),
        div:  (user, val) => user.attributes.CON = Math.floor(user.attributes.CON / val)
    },
    con: {
        set:  (user, val) => user.attributes.WIS = Math.floor(val),
        add:  (user, val) => user.attributes.WIS += Math.floor(val),
        sub:  (user, val) => user.attributes.WIS -= Math.floor(val),
        mult: (user, val) => user.attributes.WIS *= Math.floor(val),
        div:  (user, val) => user.attributes.WIS = Math.floor(user.attributes.WIS / val)
    },
    car: {
        set:  (user, val) => user.attributes.CAR = Math.floor(val),
        add:  (user, val) => user.attributes.CAR += Math.floor(val),
        sub:  (user, val) => user.attributes.CAR -= Math.floor(val),
        mult: (user, val) => user.attributes.CAR *= Math.floor(val),
        div:  (user, val) => user.attributes.CAR = Math.floor(user.attributes.CAR / val)
    },
    hp: {
        set:  (user, val) => user.stats.HP.set(Math.floor(val), user.stats.HP.max, user.stats.HP.temp),
        add:  (user, val) => user.stats.HP.increaseCurrent(Math.floor(val)),
        sub:  (user, val) => user.stats.HP.increaseCurrent(-Math.floor(val)),
        mult: (user, val) => user.stats.HP.increaseCurrent(Math.floor(user.stats.HP.current * val)),
        div:  (user, val) => user.stats.HP.increaseCurrent(Math.floor(user.stats.HP.current / val)),
    },
    fp: {
        set:  (user, val) => user.stats.FP.set(Math.floor(val), user.stats.FP.max, user.stats.FP.temp),
        add:  (user, val) => user.stats.FP.increaseCurrent(Math.floor(val)),
        sub:  (user, val) => user.stats.FP.increaseCurrent(-Math.floor(val)),
        mult: (user, val) => user.stats.FP.increaseCurrent(Math.floor(user.stats.FP.current * val)),
        div:  (user, val) => user.stats.FP.increaseCurrent(Math.floor(user.stats.FP.current / val)),
    },
    sp: {
        set:  (user, val) => user.stats.SP.set(Math.floor(val), user.stats.SP.max, user.stats.SP.temp),
        add:  (user, val) => user.stats.SP.increaseCurrent(Math.floor(val)),
        sub:  (user, val) => user.stats.SP.increaseCurrent(-Math.floor(val)),
        mult: (user, val) => user.stats.SP.increaseCurrent(Math.floor(user.stats.SP.current * val)),
        div:  (user, val) => user.stats.SP.increaseCurrent(Math.floor(user.stats.SP.current / val)),
    },
    maxhp: {
        set:  (user, val) => user.stats.HP.set(user.stats.HP.current, Math.floor(val), user.stats.HP.temp),
        add:  (user, val) => user.stats.HP.increaseMax(Math.floor(val)),
        sub:  (user, val) => user.stats.HP.increaseMax(-Math.floor(val)),
        mult: (user, val) => user.stats.HP.increaseMax(Math.floor(user.stats.HP.current * val)),
        div:  (user, val) => user.stats.HP.increaseMax(Math.floor(user.stats.HP.current / val)),
    },
    maxfp: {
        set:  (user, val) => user.stats.FP.set(user.stats.FP.current, Math.floor(val), user.stats.FP.temp),
        add:  (user, val) => user.stats.FP.increaseMax(Math.floor(val)),
        sub:  (user, val) => user.stats.FP.increaseMax(-Math.floor(val)),
        mult: (user, val) => user.stats.FP.increaseMax(Math.floor(user.stats.FP.current * val)),
        div:  (user, val) => user.stats.FP.increaseMax(Math.floor(user.stats.FP.current / val)),
    },
    maxsp: {
        set:  (user, val) => user.stats.SP.set(user.stats.SP.current, Math.floor(val), user.stats.SP.temp),
        add:  (user, val) => user.stats.SP.increaseMax(Math.floor(val)),
        sub:  (user, val) => user.stats.SP.increaseMax(-Math.floor(val)),
        mult: (user, val) => user.stats.SP.increaseMax(Math.floor(user.stats.SP.current * val)),
        div:  (user, val) => user.stats.SP.increaseMax(Math.floor(user.stats.SP.current / val)),
    },
    temphp: {
        set:  (user, val) => user.stats.HP.set(user.stats.HP.current, user.stats.HP.max, Math.floor(val)),
        add:  (user, val) => user.stats.HP.increaseTemp(Math.floor(val)),
        sub:  (user, val) => user.stats.HP.increaseTemp(-Math.floor(val)),
        mult: (user, val) => user.stats.HP.increaseTemp(Math.floor(user.stats.HP.current * val)),
        div:  (user, val) => user.stats.HP.increaseTemp(Math.floor(user.stats.HP.current / val)),
    },
    tempfp: {
        set:  (user, val) => user.stats.FP.set(user.stats.FP.current, user.stats.FP.max, Math.floor(val)),
        add:  (user, val) => user.stats.FP.increaseTemp(Math.floor(val)),
        sub:  (user, val) => user.stats.FP.increaseTemp(-Math.floor(val)),
        mult: (user, val) => user.stats.FP.increaseTemp(Math.floor(user.stats.FP.current * val)),
        div:  (user, val) => user.stats.FP.increaseTemp(Math.floor(user.stats.FP.current / val)),
    },
    tempsp: {
        set:  (user, val) => user.stats.SP.set(user.stats.SP.current, user.stats.SP.max, Math.floor(val)),
        add:  (user, val) => user.stats.SP.increaseTemp(Math.floor(val)),
        sub:  (user, val) => user.stats.SP.increaseTemp(-Math.floor(val)),
        mult: (user, val) => user.stats.SP.increaseTemp(Math.floor(user.stats.SP.current * val)),
        div:  (user, val) => user.stats.SP.increaseTemp(Math.floor(user.stats.SP.current / val)),
    },
    exp: {
        add:  (user, val) => user.stats.addExp(Math.floor(val)),
        sub:  (user, val) => user.stats.addExp(-Math.floor(val))
    },
    gold: {
        add:  (user, val) => user.stats.tryUpdateGold(Math.floor(val)),
        sub:  (user, val) => user.stats.tryUpdateGold(-Math.floor(val)),
    },
    acro: {
        set: (user, val) => user.skills.acrobatics = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.acrobatics
    },
    ades: {
        set: (user, val) => user.skills.animalTraining = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.animalTraining
    },
    atle: {
        set: (user, val) => user.skills.athletics = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.athletics
    },
    enga: {
        set: (user, val) => user.skills.deception = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.deception
    },
    furt: {
        set: (user, val) => user.skills.stealth = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.stealth
    },
    inti: {
        set: (user, val) => user.skills.intimidation = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.intimidation
    },
    intu: {
        set: (user, val) => user.skills.intuition = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.intuition
    },
    inve: {
        set: (user, val) => user.skills.investigation = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.investigation
    },
    natu: {
        set: (user, val) => user.skills.nature = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.nature
    },
    perc: {
        set: (user, val) => user.skills.perception = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.perception
    },
    perf: {
        set: (user, val) => user.skills.performance = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.performance
    },
    pers: {
        set: (user, val) => user.skills.persuasion = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.persuasion
    },
    pres: {
        set: (user, val) => user.skills.jugglery = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.jugglery
    },
    sobr: {
        set: (user, val) => user.skills.survivability = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.survivability
    },
    pfor: {
        set: (user, val) => user.skills.strength = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.strength
    },
    pdes: {
        set: (user, val) => user.skills.dexterity = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.dexterity
    },
    pconst: {
        set: (user, val) => user.skills.constitution = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.constitution
    },
    pcon: {
        set: (user, val) => user.skills.wisdom = skillsValuesMap[val] ? skillsValuesMap[val]: user.skills.wisdom
    },
    pcar: {
        set: (user, val) => user.skills.charisma = skillsValuesMap[val] ? skillsValuesMap[val] : user.skills.charisma
    }
};