class Role {
    static ADM_TYPE = "ADM";
    static GM_TYPE = "GM";
    static BATTLE_GM_TYPE = "BATTLE_GM";
    static MODERATOR_TYPE = "MODERATOR";
    static PLAYER_TYPE = "PLAYER";
    static ENLIGHTENED_PLAYER_TYPE = "ENLIGHTENED_PLAYER";
    static TEMP_PLAYER_TYPE = "TEMP_PLAYER";
    static UNFINISHED_SHEET_TYPE = "UNFINISHED_SHEET";
    static USER_TYPE = "USER";
    static BOOSTER1_TYPE = "BOOSTER1";
    static BOOSTER2_TYPE = "BOOSTER2";
    static SILENT_TYPE = "SILENT"; // TODO: ver se vai apagar isso aqui ou n

    constructor(guildId, roleId, type) {
        this.guildId = guildId;
        this.roleId = roleId;
        this.type = type;
    }

    static fromDTO(roleDTO) {
        if (!roleDTO) {
            return null;
        }

        return new Role(roleDTO.guildId, roleDTO.roleId, roleDTO.type);
    }
}

module.exports = Role;
