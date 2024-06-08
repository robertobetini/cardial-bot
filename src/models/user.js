const Attributes = require("./attributes");
const Stats = require("./stats");
const Skills = require("./skills");

const Constants = require("../constants");

const { calculateAttributeMod } = require("../calculators/modCalculator");

class User {
    constructor(userId, guildId, name, imgUrl, silenceEndTime = null, playerName = "", job = "", notes = "", attributes = null, stats = null, skills = null) {
        this.userId = userId;
        this.guildId = guildId;
        this.username = name;
        this.imgUrl = imgUrl;
        this.silenceEndTime = silenceEndTime;
        this.playerName = playerName;
        this.job = job;
        this.notes = notes

        this.attributes = attributes || new Attributes(userId, guildId);
        this.stats = stats || new Stats(userId, guildId);
        this.skills = skills || new Skills(userId, guildId);
    }

    addExp(exp) { 
        const levelBefore = this.stats?.lvl;
        this.stats?.addExp(exp); 
        const levelAfter = this.stats?.lvl;

        for (let i = 0; i < levelAfter - levelBefore; i++) {
            this.levelUp();
        }
    }

    tryUpdateGold(amount) {
        this.stats?.tryUpdateGold(amount);
    }

    levelUp() {
        this.stats.maxHP += Constants.BASE_MAX_HP_PER_LEVEL + calculateAttributeMod(this.attributes.CON);
        this.stats.currentHP += Constants.BASE_MAX_HP_PER_LEVEL + calculateAttributeMod(this.attributes.CON);

        this.stats.maxFP += Constants.BASE_MAX_FP_PER_LEVEL;
        this.stats.currentFP += Constants.BASE_MAX_FP_PER_LEVEL;

        this.stats.maxSP += Constants.BASE_MAX_SP_PER_LEVEL;
        this.stats.currentSP += Constants.BASE_MAX_SP_PER_LEVEL;

        this.attributes.availablePoints += Constants.ATTRIBUTE_PER_LEVEL;
    }

    static fromDTO(userDTO) {
        return new User(
            userDTO.userId, 
            userDTO.guildId,
            userDTO.user,
            userDTO.imgUrl,
            userDTO.silenceEndTime,
            userDTO.playerName,
            userDTO.job,
            userDTO.notes,
            Attributes.fromDTO(userDTO),
            Stats.fromDTO(userDTO),
            Skills.fromDTO(userDTO)
        );
    }
}

module.exports = User;
