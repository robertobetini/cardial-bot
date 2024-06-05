const Discord = require("discord.js");
const moment = require("moment");

const userDAO = require("./../DAOs/userDAO");
const expCalculator = require("../expCalculator");
const RoleService = require("./roleService");
const User = require("../models/user");
const Role = require("../models/role");

const COLUMN_SIZE = 20;
const PAGE_SIZE = 2;

class StatusService {
    static async getExpLeaderboard(guildId, page) {
        const users =  await userDAO.getAllFromGuild(guildId, "totalExp", page * PAGE_SIZE, PAGE_SIZE);

        let leaderboard = this.createTable(
            [ "User", "Level", "EXP" ], 
            users.map(user => [ user.username, user.stats?.lvl.toString(), user.stats?.exp.toString() ]));

        return leaderboard;
    }

    static async getGoldLeaderboard(guildId, page) {
        const users = await userDAO.getAllFromGuild(guildId, "gold", page * PAGE_SIZE, PAGE_SIZE);

        let leaderboard = this.createTable(
            [ "User", "GOLD" ], 
            users.map(user => [ user.username, `$${user.stats?.gold}` ]));

        return leaderboard;
    }

    static async getUserStatus(guildId, discordUser, statusBarSize = 16) {
        let user = await userDAO.get(discordUser.id, guildId, true);
        
        if (!user) {
            user = new User(
                discordUser.id,
                guildId,
                discordUser.username
            );

            await userDAO.upsert(user, true);
        }
        
        const maxLvlExp = expCalculator.getLevelExp(user.stats.lvl);
        console.log(user.stats);
        const expBar = StatusService.createStatusBar("EXP", user.stats.exp, maxLvlExp, 0, statusBarSize);
        const hpBar = StatusService.createStatusBar("HP", user.stats.currentHP, user.stats.maxHP, user.stats.tempHP, statusBarSize);
        const fpBar = StatusService.createStatusBar("FP", user.stats.currentFP, user.stats.maxFP, user.stats.tempFP, statusBarSize);
        const spBar = StatusService.createStatusBar("SP", user.stats.currentSP, user.stats.maxSP, user.stats.tempSP, statusBarSize);

        let silenceTimespan = "-";
        if (user.silenceEndTime) {
            silenceTimespan = moment(user.silenceEndTime).toNow(true);
        }

        return "```r\n" +
        `User: ${user.username}\n\n` +

        `┌|  STATUS   |──►\n` +
        `| ${expBar}\n` +
        `| ${hpBar}\n` +
        `| ${fpBar}\n` +
        `| ${spBar}\n` +
        `| \n` +
        `| Personagem: ${user.playerName}\n` +
        `| Profissão:  ${user.job}\n` +
        `| Level:      ${user.stats?.lvl}\n` +
        `| Gold:       $ ${user.stats?.gold}\n\n` +

        `┌| ATRIBUTOS |──►\n` +
        `| FOR:        ${user.attributes.FOR}\n` +
        `| DEX:        ${user.attributes.DEX}\n` +
        `| CON:        ${user.attributes.CON}\n` +
        `| WIS:        ${user.attributes.WIS}\n` +
        `| CHA:        ${user.attributes.CHA}\n\n` +

        `Ocupado:      ${silenceTimespan}` + 
        "```";
    }

    static async updateUserSilentRoles() {
        console.log("Running update silent roles routine.");

        const roles = await RoleService.getAllRoles();
        const users = await userDAO.getAllSilent();

        for (let user of users) {
            const now = new Date().getTime();
            if (user.silenceEndTime && now > user.silenceEndTime) {
                const role = roles.find(role => role.type === Role.SILENT_TYPE && role.guildId === user.guildId);
                const updateRoleEndpoint = Discord.Routes.guildMemberRole(user.guildId, user.userId, role.roleId);
                const rest = new Discord.REST().setToken(process.env.TOKEN);
                const _data = await rest.delete(updateRoleEndpoint);
                user.silenceEndTime = null;
                await userDAO.update(user);
            }
        }
    }

    static createTable(columnNames, rows) {
        let table = "```\n";

        let header = this.generateTableRow(columnNames);
        table += header;
        table += this.generateRepeatedSequenceOfText(columnNames.length * COLUMN_SIZE, "-") + "\n";

        for (let row of rows) {
            const line = this.generateTableRow(row);
            table += line;
        }

        table += "```";

        return table;
    }

    static generateTableRow(values) {
        let line = "";

        for (let value of values) {
            const whiteSpaces = this.generateWhiteSpace(COLUMN_SIZE - value.length + 1);
            let truncatedValue = value;

            if (truncatedValue.length > 20) {
                truncatedValue = truncatedValue.substring(0, COLUMN_SIZE);
            }

            line += `${truncatedValue}${whiteSpaces}`;
        }

        line.trimEnd();
        line += "\n";

        return line;
    }

    static generateWhiteSpace(num) {
        return this.generateRepeatedSequenceOfText(num, " ");
    }

    static generateRepeatedSequenceOfText(num, str) {
        let whiteSpaces = "";
        for (let i = 0; i < num; i++) {
            whiteSpaces += str;
        }

        return whiteSpaces;
    }

    static createStatusBar(statusName, currentValue, maxValue, tempValue, barSize) {
        const progression = Math.floor((currentValue + tempValue) / (maxValue + tempValue) * barSize);

        let bar = "[";
        for (let i = 1; i <= barSize; i++) {
            bar += progression >= i ? "▬" : " ";
        }
        bar += `] ${currentValue + tempValue} / ${maxValue + tempValue} `;
        bar += tempValue > 0 ? `(+${tempValue}) ` : "";
        bar += statusName;

        return bar;
    }
}

module.exports = StatusService;
