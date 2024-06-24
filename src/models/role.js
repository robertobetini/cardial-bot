class Role {
    static ADM_TYPE = "ADM";
    static SILENT_TYPE = "SILENT";

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
