const RoleService = require("../services/roleService");
const userDAO = require("../DAOs/userDAO");
const Role = require("../models/role");
const Logger = require("../logger");

module.exports = {
    execute: async () => {
        Logger.info("Running update silent roles routine.");

        const roles = RoleService.getAllRoles();
        const users = userDAO.getAllSilent();
        const now = new Date().getTime();

        for (let user of users) {
            if (user.silenceEndTime && now > user.silenceEndTime) {
                const role = roles.find(role => role.type === Role.SILENT_TYPE && role.guildId === user.guildId);
                const updateRoleEndpoint = Discord.Routes.guildMemberRole(user.guildId, user.userId, role.roleId);
                const rest = new Discord.REST().setToken(process.env.TOKEN);
                const _data = await rest.delete(updateRoleEndpoint);
                user.silenceEndTime = null;
                userDAO.update(user);
            }
        }
    }
}