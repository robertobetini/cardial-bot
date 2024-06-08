const expCalculator = require("../expCalculator");
const Attributes = require("./attributes");
const Stats = require("./stats");
const Skills = require("./skills");

class User {
    constructor(userId, guildId, name, silenceEndTime = null, playerName = "", job = "", notes = "", attributes = null, stats = null, skills = null) {
        this.userId = userId;
        this.guildId = guildId;
        this.username = name;
        this.silenceEndTime = silenceEndTime;
        this.playerName = playerName;
        this.job = job;
        this.notes = notes

        this.attributes = attributes || new Attributes(userId, guildId);
        this.stats = stats || new Stats(userId, guildId);
        this.skills = skills || new Skills(userId, guildId);
    }

    addExp(exp) { 
        const levelBefore = this.stats.lvl;
        this.stats?.addExp(exp); 
        const levelAfter = this.stats.lvl;

        for (let i = 0; i < levelAfter - levelBefore; i++) {
            this.levelUp();
        }
    }

    tryUpdateGold(amount) {
        this.stats?.tryUpdateGold(amount);
    }

    levelUp() {
        return;
    }

    static fromDTO(userDTO) {
        return new User(
            userDTO.userId, 
            userDTO.guildId,
            userDTO.user,
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
