const expCalculator = require("../expCalculator");
const Attributes = require("./attributes");
const Stats = require("./stats");
const Skills = require("./skills");

class User {
    constructor(userId, guildId, name, silenceEndTime = null, playerName = null, job = null, attributes = null, stats = null, skills = null) {
        this.userId = userId;
        this.guildId = guildId;
        this.username = name;
        this.silenceEndTime = silenceEndTime;
        this.playerName = playerName;
        this.job = job;

        this.attributes = attributes || new Attributes(userId, guildId);
        this.stats = stats || new Stats(userId, guildId);
        this.skills = skills || new Skills(userId, guildId);
    }

    addExp = (exp) => this.stats?.addExp(exp);
    tryUpdateGold = (amount) => this.stats?.tryUpdateGold(amount);

    static fromDTO(userDTO) {
        return new User(
            userDTO.userId, 
            userDTO.guildId,
            userDTO.user,
            userDTO.silenceEndTime,
            userDTO.playerName,
            userDTO.job,
            userDTO.attributes,
            userDTO.stats,
            userDTO.skills
        );
    }
}

module.exports = User;
