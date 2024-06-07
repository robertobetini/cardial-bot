class Attributes {
    constructor(userId, guildId, $for = 7, dex = 7, con = 7, wis = 7, cha = 7, availablePoints = 25) {
        this.userId = userId;
        this.guildId = guildId;
        this.FOR = $for;
        this.DEX = dex;
        this.CON = con;
        this.WIS = wis;
        this.CHA = cha;
        this.availablePoints = availablePoints;
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
            fullUserDTO.availablePoints
        );
    }
}

module.exports = Attributes;
