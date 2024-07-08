const Constants = require("../constants");

class Attributes {
    constructor(userId, guildId, str = 7, dex = 7, con = 7, wis = 7, cha = 7, availablePoints = Constants.INITIAL_AVAILABLE_ATTRIBUTES, firstAttributionDone = false) {
        this.userId = userId;
        this.guildId = guildId;
        this.STR = str;
        this.DEX = dex;
        this.CON = con;
        this.WIS = wis;
        this.CHA = cha;
        this.availablePoints = availablePoints;
        this.firstAttributionDone = firstAttributionDone;
    }

    static fromDTO(fullUserDTO) {
        if (!fullUserDTO) {
            return null;
        }
        
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
