class Attributes {
    constructor(userId, guildId, $for = 0, dex = 0, con = 0, wis = 0, cha = 0) {
        this.userId = userId;
        this.guildId = guildId;
        this.FOR = $for;
        this.DEX = dex;
        this.CON = con;
        this.WIS = wis;
        this.CHA = cha;
    }
}

module.exports = Attributes;