class Attributes {
    constructor(userId, guildId, $for = 7, dex = 7, con = 7, wis = 7, cha = 7, availablePoints = 25, firstAttributionDone = false) {
        this.userId = userId;
        this.guildId = guildId;
        this.FOR = $for;
        this.DEX = dex;
        this.CON = con;
        this.WIS = wis;
        this.CHA = cha;
        this.availablePoints = availablePoints;
        this.firstAttributionDone = firstAttributionDone;
    }

    static fromDTO(fullUserDTO) {
        return new Attributes(
            fullUserDTO.userId,
            fullUserDTO.guildId,
            fullUserDTO.FOR,
            fullUserDTO.DEX,
            fullUserDTO.CON,
            fullUserDTO.WIS,
            fullUserDTO.CHA,
            fullUserDTO.availablePoints,
            fullUserDTO.firstAttributionDone == 1
        );
    }
}

module.exports = Attributes;
