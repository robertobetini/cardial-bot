class AdmRole {
    constructor(guildId, roleId) {
        this.guildId = guildId;
        this.roleId = roleId;
    }

    static fromDTO(admUserDTO) {
        return new AdmRole(admUserDTO.guildId, admUserDTO.roleId);
    }
}

module.exports = AdmRole;
