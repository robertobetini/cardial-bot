const Discord = require("discord.js");
const moment = require("moment");

const userDAO = require("../DAOs/userDAO");
const expCalculator = require("../expCalculator");
const RoleService = require("./roleService");

const User = require("../models/user");
const Role = require("../models/role");

const COLUMN_SIZE = 20;
const PAGE_SIZE = 2;

class EmbededResponseService {
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

    static async getUserStatus(guildId, discordUser) {
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

        let silenceTimespan = "-";
        if (user.silenceEndTime) {
            silenceTimespan = moment(user.silenceEndTime).toNow(true);
        }

        const hpView = EmbededResponseService.createStatusSummarizedView(user.stats.currentHP, user.stats.maxHP, user.stats.tempHP);
        const fpView = EmbededResponseService.createStatusSummarizedView(user.stats.currentFP, user.stats.maxFP, user.stats.tempFP);
        const spView = EmbededResponseService.createStatusSummarizedView(user.stats.currentSP, user.stats.maxSP, user.stats.tempSP);
        const expView = EmbededResponseService.createStatusSummarizedView(user.stats.exp, maxLvlExp, 0);

        // { 
        //     name: "> Status <",
        //     inline: true,
        //     value: 
        //         `**🔴 HP:** ${hpView}ㅤㅤㅤㅤㅤ|   **⭐️ Nível:** 2 (${expView}\n` +
        //         `**🔵 FP:** ${fpView}ㅤㅤㅤㅤㅤㅤ| **⚔️ R.Arma:** TODO\n` +
        //         `**🟣 SP:** ${spView}ㅤㅤㅤㅤㅤㅤ| **💼 R.Profissão:** TODO\n` +
        //         `**🛡️ DEF:** ${user.stats.baseDEF}ㅤ   ㅤㅤㅤㅤ|  **💰 Gold:** ${user.stats.gold}\n` +
        //         `**🎯 B.Proficiencia:** TODOㅤ| **Buff/Debuff:** TODO\n`   
        // },

        const embedFields = [
            { 
                name: "> Status",
                inline: true,
                value: 
                    `**🔴 HP:** ${hpView}\n` +
                    `**🔵 FP:** ${fpView}\n` +
                    `**🟣 SP:** ${spView}\n` +
                    `**🛡️ DEF:** ${user.stats.baseDEF}\n` +
                    `**🎯 B.Proficiencia:** TODO`   
            },
            { 
                name: "> Status", 
                inline: true,
                value: 
                    `**⭐️ Nível:** ${user.stats.lvl} (${expView} exp)\n` +
                    `**⚔️ R.Arma:** TODO\n` +
                    `**💼 R.Profissão:** TODO\n` +
                    `**💰 Gold:** ${user.stats.gold}\n` +
                    `**✨ Buff:** TODO\n` +
                    `**☠️ Debuff:** TODO`
            },
            {
                name: "> Atributos",
                value:
                    `Força: ${user.attributes.FOR}\n` +
                    `Destreza: ${user.attributes.DEX}\n` +
                    `Constituição: ${user.attributes.CON}\n` +
                    `Conhecimento: ${user.attributes.WIS}\n` +
                    `Carisma: ${user.attributes.CHA}` 
            }
        ];

        return new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle(user.playerName || "<sem_nome>")
            .setDescription(user.notes || " ")
            .setAuthor({ name: `Personagem de ${user.username}` })
            .addFields(embedFields)
            .setTimestamp()
            .setFooter({ text: "Cardial Bot" });
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

    static createStatusSummarizedView(currentValue, maxValue, tempValue) {
        let view = `${currentValue} / ${maxValue + tempValue}`;
        view += tempValue > 0 ? ` (+${tempValue}) ` : "";

        return view;
    }

    static createStatusBar(statusName, currentValue, maxValue, tempValue, barSize) {
        const progression = Math.floor((currentValue + tempValue) / (maxValue + tempValue) * barSize);

        let bar = "[";
        for (let i = 1; i <= barSize; i++) {
            bar += progression >= i ? "▬" : " ";
        }
        bar += `] ${currentValue} / ${maxValue + tempValue} `;
        bar += tempValue > 0 ? ` (+${tempValue}) ` : "";
        bar += statusName;

        return bar;
    }
}

module.exports = EmbededResponseService;
