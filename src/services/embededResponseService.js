const Discord = require("discord.js");
const moment = require("moment");

const userDAO = require("../DAOs/userDAO");
const expCalculator = require("../expCalculator");

const User = require("../models/user");

const PAGE_SIZE = 10;

class EmbededResponseService {
    static async getExpLeaderboard(guildId, page) {
        const users =  await userDAO.getAllFromGuild(guildId, "totalExp", page * PAGE_SIZE, PAGE_SIZE);

        const fields = this.createTable(
            [ "User", "Level", "EXP" ], 
            users.map(user => [ user.username, user.stats?.lvl.toString(), user.stats?.exp.toString() ]));

        const isEmpty = fields[0].value.trim().length < 1;
        return [new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle("Placar de nível")
            .setFields(fields)
            .setTimestamp()
            .setFooter({ text: "Cardial Bot" }), isEmpty];
    }

    static async getGoldLeaderboard(guildId, page) {
        const users = await userDAO.getAllFromGuild(guildId, "gold", page * PAGE_SIZE, PAGE_SIZE);

        let fields = this.createTable(
            [ "User", "GOLD" ], 
            users.map(user => [ user.username, `$${user.stats?.gold}` ]));

        const isEmpty = fields[0].value.trim().length < 1;
        return [new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle("Placar de gold")
            .setFields(fields)
            .setTimestamp()
            .setFooter({ text: "Cardial Bot" }), isEmpty];;
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
                name: `> Atributos (${user.attributes.availablePoints})`,
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

    static createTable(columnNames, rows) {
        const fields = [];
        for (let columnName of columnNames) {
            fields.push({ name: `> ${columnName}`, value: "\n", inline: true });
        }

        for (let i = 0; i < fields.length; i++) {
            for (let row of rows) {
                fields[i].value += `${row[i]}   \n`;
            }
        }

        return fields;
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
