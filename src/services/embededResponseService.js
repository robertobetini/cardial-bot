const Discord = require("discord.js");
const moment = require("moment");

const userDAO = require("../DAOs/userDAO");
const skillsDAO = require("../DAOs/skillsDAO");
const expCalculator = require("../calculators/expCalculator");
const modCalculator = require("../calculators/modCalculator");

const User = require("../models/user");

const Constants = require("../constants");

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
            .setFooter({ text: "Cardial Bot" }), isEmpty];
    }

    static async getUserSkills(guildId, userId) {
        const user = await EmbededResponseService.getOrCreateUser(userId, guildId, true);

        const fields = [
            { name: "> Perícia", value: "\n", inline: true },
            { name: "> Proficiência", value: "\n", inline: true }
        ];

        const translation = {
            "NoProficiency": "Sem proficiência",
            "Proficient": "Proficiente",
            "Specialist": "Especialista"
        }
        for (let skill of Constants.skills) {
            fields[0].value += `${skill.label}\n`;
            fields[1].value += `${translation[user.skills[skill.value]]}\n`;
        }

        return new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setThumbnail(user.imgUrl)
            .setTitle(user.playerName || "<sem_nome>")
            .setDescription(user.notes || " ")
            .setAuthor({ name: `Personagem de ${user.username}` })
            .addFields(fields)
            .setTimestamp()
            .setFooter({ text: "Cardial Bot" });
    }

    static async getUserStatus(guildId, discordUser, tempAttributes = null) {
        let user = await EmbededResponseService.getOrCreateUser(guildId, discordUser);
        
        const maxLvlExp = expCalculator.getLevelExp(user.stats.lvl);

        let silenceTimespan = "-";
        if (user.silenceEndTime) {
            silenceTimespan = moment(user.silenceEndTime).toNow(true);
        }

        const hpView = EmbededResponseService.createStatusSummarizedView(user.stats.currentHP, user.stats.maxHP, user.stats.tempHP);
        const fpView = EmbededResponseService.createStatusSummarizedView(user.stats.currentFP, user.stats.maxFP, user.stats.tempFP);
        const spView = EmbededResponseService.createStatusSummarizedView(user.stats.currentSP, user.stats.maxSP, user.stats.tempSP);
        const expView = EmbededResponseService.createStatusSummarizedView(user.stats.exp, maxLvlExp, 0);

        const attributes = tempAttributes || user.attributes;
        const calcMod = modCalculator.calculateAttributeMod;
        const forMod = calcMod(attributes.FOR);
        const dexMod = calcMod(attributes.DEX);
        const conMod = calcMod(attributes.CON);
        const wisMod = calcMod(attributes.WIS);
        const chaMod = calcMod(attributes.CHA);

        const sanityDescription = EmbededResponseService.getSanityDescription(user.stats.currentSP);
        const embedFields = [
            { 
                name: "> Status",
                inline: true,
                value: 
                    `**🔴 HP:** ${hpView}\n` +
                    `**🔵 FP:** ${fpView}\n` +
                    `**🟣 SP:** ${spView} (${sanityDescription})\n` +
                    `**🛡️ CA:** ${user.stats.baseDEF + dexMod}\n` +
                    `**🎯 B. Proficiência:** +${modCalculator.calculateProficiencyMod(user.stats.lvl)}\n` +
                    `**👁️ Iniciativa:** ${user.stats.baseInitiative + dexMod}`
            },
            { 
                name: "> Status", 
                inline: true,
                value: 
                    `**⭐️ Nível:** ${user.stats.lvl} (${expView} exp)\n` +
                    `**⚔️ R.Arma:** TODO\n` +
                    `**💼 R.Profissão:** TODO\n` +
                    `**💰 Gold:** ${user.stats.gold}\n`
            },
            {
                name: "\n",
                value: "\n",
            },
            {
                name: `> Atributos (${attributes.availablePoints > 0 ? "+" : ""}${attributes.availablePoints})`,
                inline: true,
                value:
                    `Força: ${attributes.FOR}\n` +
                    `Destreza: ${attributes.DEX}\n` +
                    `Constituição: ${attributes.CON}\n` +
                    `Conhecimento: ${attributes.WIS}\n` +
                    `Carisma: ${attributes.CHA}`
            },
            {
                name: `> Mod`,
                inline: true,
                value:
                    `${forMod >= 0 ? "+" : ""}${forMod}\n` +
                    `${dexMod >= 0 ? "+" : ""}${dexMod}\n` +
                    `${conMod >= 0 ? "+" : ""}${conMod}\n` +
                    `${wisMod >= 0 ? "+" : ""}${wisMod}\n` +
                    `${chaMod >= 0 ? "+" : ""}${chaMod}`
            }
        ];

        return new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle(user.playerName || "<sem_nome>")
            .setThumbnail(user.imgUrl)
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

    static getSanityDescription(currentSP) {
        if (currentSP === 25) { return "são"; }
        if (currentSP > 20) { return "desconfiado"; }
        if (currentSP > 15) { return "assustado"; }
        if (currentSP > 10) { return "apavorado"; }
        if (currentSP > 5) { return "loucura parcial"; }
        if (currentSP > 0) { return "insanidade"; }
    }

    static async getOrCreateUser(guildId, userToGet) {
        let user = await userDAO.get(userToGet.id, guildId);
        
        if (!user) {
            console.log(`Creating user for ${userToGet.username}`)
            user = new User(
                userToGet.id,
                guildId,
                userToGet.username,
                userToGet.displayAvatarURL()
            );

            await userDAO.insert(user, true);
        }

        return user;
    }
}

module.exports = EmbededResponseService;
