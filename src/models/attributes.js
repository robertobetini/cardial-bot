class Attributes {
    constructor(userId, guildId, $for = 7, dex = 7, con = 7, wis = 7, cha = 7) {
        this.userId = userId;
        this.guildId = guildId;
        this.FOR = $for;
        this.DEX = dex;
        this.CON = con;
        this.WIS = wis;
        this.CHA = cha;
    }

    static fromDTO(fullUserDTO) {
        return new Attributes(
            fullUserDTO.userId,
            fullUserDTO.guildId,
            fullUserDTO.FOR,
            fullUserDTO.DEX,
            fullUserDTO.CON,
            fullUserDTO.WIS,
            fullUserDTO.CHA
        );
    }
}

module.exports = Attributes;
