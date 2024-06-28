const Discord = require("discord.js");

const expCalculator = require("../calculators/expCalculator");
const modCalculator = require("../calculators/modCalculator");
const challengeModCalculator = require("../calculators/challengeModCalculator");

const UserService = require("../services/userService");

const Constants = require("../constants");
const Colors = require("../colors");

const DEFAULT_FOOTER = "Elysium Systemㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ⁣ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ⁣";
const SHORT_FOOTER = "Elysium Systemㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ⁣ㅤㅤㅤ⁣";
const SHORTEST_FOOTER = "Elysium System";

class EmbededResponseService {
    static getExpLeaderboard(guildId, page) {
        const users = UserService.getAllFromGuild(guildId, "totalExp", page * Constants.PAGE_SIZE, Constants.PAGE_SIZE);

        const table = EmbededResponseService.createTable(
            [ { name: "User", size: 17 }, { name: "Level", size: 7 }, { name: "EXP", size: 7 } ], 
            users.map(user => [ user.playerName, user.stats?.lvl.toString(), user.stats?.exp.toString() ]));

        const isEmpty = users.length < 1;
        return [new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle("Placar de nível")
            .setDescription(table)
            .setFooter({ text: SHORT_FOOTER }), isEmpty];
    }

    static getGoldLeaderboard(guildId, page) {
        const users = UserService.getAllFromGuild(guildId, "gold", page * Constants.PAGE_SIZE, Constants.PAGE_SIZE);

        const table = EmbededResponseService.createTable(
            [ { name: "User", size: 22 }, { name: "GOLD", size: 10 } ], 
            users.map(user => [ user.playerName, `${user.stats?.gold}` ]));

        const isEmpty = users.length < 1;
        return [new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle("Placar de gold")
            .setDescription(table)
            .setFooter({ text: SHORT_FOOTER }), isEmpty];
    }

    static getUserSkills(guildId, discordUser) {
        const user = typeof(discordUser) === "string" 
            ? UserService.get(guildId, discordUser, true) 
            : UserService.getOrCreateUser(guildId, discordUser, true);
        
        const translation = {
            "NoProficiency": "S/Prof.",
            "Proficient": "Prof.",
            "Specialist": "Esp.",
            "FOR": "For",
            "DEX": "Des",
            "CON": "Con",
            "WIS": "Sab",
            "CHA": "Car",
        }
        const columns = [ { name: "Perícia", size: 16 }, { name: "Atr", size: 3}, { name: "Prof", size: 7}, { name: "Mod", size: 3 } ];
        const rows = Constants.skills.map(skill => {
            const challengeMod = challengeModCalculator.calculateChallengeMod(skill.value, user);
            return [
                skill.label, 
                translation[Constants.CHALLENGE_TO_ATTRIBUTE_MAP[skill.value]],
                translation[user.skills[skill.value]], 
                `${challengeMod >= 0 ? "+" : ""}${challengeMod}`];
        });
        const table = EmbededResponseService.createTable(columns, rows);

        return new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle(user.playerName || "<sem_nome>")
            .addFields({ name: "> Perícias",  value: table })
            .setDescription(user.notes || " ")
            .setAuthor({ name: `Personagem de ${user.username}` })
            .setFooter({ text: SHORT_FOOTER });
    }

    static getUserStatus(guildId, discordUser, tempAttributes = null) {
        let user = UserService.getOrCreateUser(guildId, discordUser);
        
        const maxLvlExp = expCalculator.getLevelExp(user.stats.lvl);

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

        const statsView1 = 
            `**🔴 HP:** ${hpView}\n` +
            `**🔵 FP:** ${fpView}\n` +
            `**🟣 SP:** ${spView} (${sanityDescription})\n` +
            `**🛡️ CA:** ${user.stats.baseDEF + dexMod}\n` +
            `**🎯 B. Proficiência:** +${modCalculator.calculateProficiencyBonus(user.stats.lvl)}\n` +
            `**👁️ Iniciativa:** ${user.stats.baseInitiative + dexMod}`;
        const statsView2 =
            `**⭐️ Nível:** ${user.stats.lvl} (${expView} exp)\n` +
            // `**⚔️ R.Arma:** TODO\n` +
            // `**💼 R.Profissão:** TODO\n` +
            `**💰 Gold:** ${user.stats.gold}\n`;

        const attributesTableColumns = [{ name: "Atributo", size: 12 }, { name: "Val", size: 4 }, { name: "Mod", size: 3 }];
        const attributesTableRows = [
            ["Força", attributes.FOR.toString(), `${forMod >= 0 ? "+" : ""}${forMod}`],
            ["Destreza", attributes.DEX.toString(), `${dexMod >= 0 ? "+" : ""}${dexMod}`],
            ["Constituição", attributes.CON.toString(), `${conMod >= 0 ? "+" : ""}${conMod}`],
            ["Conhecimento", attributes.WIS.toString(), `${wisMod >= 0 ? "+" : ""}${wisMod}`],
            ["Carisma", attributes.CHA.toString(), `${chaMod >= 0 ? "+" : ""}${chaMod}`],
        ];
        const attributesTable = EmbededResponseService.createTable(attributesTableColumns, attributesTableRows);

        const fields = [
            { name: "> Status"      , value: statsView1     , inline: true  }, 
            { name: "> Informações" , value: statsView2     , inline: true  }, 
            { name: `> Atributos (${attributes.availablePoints > 0 ? "+" : ""}${attributes.availablePoints})`   , value: attributesTable, inline: false }
        ];

        return new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle(user.playerName || "<sem_nome>")
            .setThumbnail(user.imgUrl)
            .setDescription(user.notes || " ")
            .setAuthor({ name: `Personagem de ${user.username}` })
            .addFields(fields)
            .setFooter({ text: SHORTEST_FOOTER });
    }

    static createTable(columns, rows, separator = " ") {
        let totalSize = 0;
        let table = "```ansi\n";
        for (const column of columns) {
            table += `${Colors.BOLD}${column.name.substr(0, column.size)}${EmbededResponseService.generateCharSequence(" ", column.size - column.name.length)}${separator}`;
            totalSize += column.size;
        }
        totalSize += columns.length - 1;
        if (totalSize > Constants.MOBILE_LINE_SIZE) {
            throw new Error(`Total column size '${totalSize}' exceed MOBILE_LINE_SIZE '${Constants.MOBILE_LINE_SIZE}'!`);
        }
        
        table = table.substring(0, table.length - 1) + "\n";
        table += EmbededResponseService.generateCharSequence("─", totalSize) + Colors.RESET  + "\n";

        for (const row of rows) {
            for (let i = 0; i < columns.length; i++) {
                table += `${row[i].substr(0, columns[i].size)}${EmbededResponseService.generateCharSequence(" ", columns[i].size - row[i].length)}${separator}`;
            }
            table = table.substring(0, table.length - 2) + "\n";
        }
        table += "```";

        return table;
    }

    static generateCharSequence(char, count) {
        let whiteSpaces = "";
        for (let i = 0; i < count; i++) {
            whiteSpaces += char;
        }
        return whiteSpaces;
    }

    static getRollView(dice, results, rerollsSoFar = 0) {
        const calculateWhiteSpaces = (value) => {
            if (value >= 1000) { return " ";   }
            if (value >=  100) { return "  ";  } 
            if (value >=   10) { return "   "; }
            return "    ";
        }

        const total = results.reduce((acc, current) => acc += current, 0);
        let response = "```ansi\n";
        for (let result of results) {
            response += `${calculateWhiteSpaces(result)}${result}\n`;
        }
        response += 
            "─────\n" +
            `${Colors.BOLD}${calculateWhiteSpaces(total)}${total}\n` +
            "```";

        return new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle(`${results.length}d${dice}${rerollsSoFar > 0 ? ` (${rerollsSoFar})` : ""}`)     
            .setDescription(response)
            .setFooter({ text: SHORTEST_FOOTER });
    }

    static getSmartRollView(challenge, dice, diceValue, modValues, rerollsSoFar = 0) {
        const modsTotal = modValues.reduce((acc, current) => acc += current, 0);
        const total = diceValue + modsTotal;

        const modsDiscriminator = modValues.reduce((text, current) => text += `[${current > 0 ? Colors.GREEN + "+" : Colors.RED + ""}${current}${Colors.RESET}] `, "");
        const response =  
            `\`${dice} (${modsTotal > 0 ? "+" : ""}${modsTotal})\`` + 
            "\n" + 
            `\`\`\`ansi\n${Colors.BOLD}${total}${Colors.RESET} <- [${Colors.GREEN}${diceValue}${Colors.RESET}] ${modsDiscriminator}\`\`\``;

        const challengeLabel = Constants.challenges.find(s => s.value === challenge)?.label;

        return new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle(`Teste de ${challengeLabel}${rerollsSoFar > 0 ? ` (${rerollsSoFar})` : ""}`)     
            .setDescription(response)
            .setFooter({ text: SHORT_FOOTER });
    }

    static getInitiativeView(players, monsters) {
        const nameSize = 14;
        let headerWhiteSpaces = "";
        for (let i = 0; i < nameSize - "Nome".length; i++) {
            headerWhiteSpaces += " ";
        }

        const response = 
            "```ansi\n" +
            `  👤${Colors.BOLD}Nome` + headerWhiteSpaces + " 🔵FP    " + ` 🔴HP ${Colors.RESET}\n` +
            players.reduce((text, p) => text += EmbededResponseService.createInitiativeLine(p, false, nameSize), "") + 
            "  ────────────────────────────────\n" + 
            monsters.reduce((text, m) => text += EmbededResponseService.createInitiativeLine(m, true, nameSize), "") + 
            "\n```";

        return new Discord.EmbedBuilder()
            .setColor(0xbbbbbb)
            .setTitle("Iniciativa")
            .setDescription(response)
            .setFooter({ text: SHORT_FOOTER });
    }

    static createInitiativeLine(combatEntity, isEnemy = false, nameSize = 14, separator = " ") {
        let line = combatEntity.selected ? Colors.GREEN : "";
        line += combatEntity.selected ? "> " : "  ";

        if (isEnemy) {
            return line + (combatEntity.playerName ?? combatEntity.name) + "\n";
        }

        const name = (combatEntity.playerName ?? combatEntity.name).substr(0, nameSize);
        line += name;

        const whiteSpaceCount = name.length > nameSize ? 0 : nameSize - name.length;
        for (let i = 0; i < whiteSpaceCount; i++) {
            line += " ";
        }

        const fpView = EmbededResponseService.createInitiativeStatView(combatEntity.stats.currentFP, combatEntity.stats.maxFP, combatEntity.stats.tempFP, Colors.BLUE, 2);
        const hpView = EmbededResponseService.createInitiativeStatView(combatEntity.stats.currentHP, combatEntity.stats.maxHP, combatEntity.stats.tempHP, Colors.RED, 3);

        return `${line} ${separator} ${combatEntity.selected ? Colors.RESET : ""}${fpView} ${separator} ${hpView}\n`;
    }

    static createInitiativeStatView(currentValue, maxValue, tempValue, ansiColor, truncateStatLen = 4) {
        let firstWhiteSpaces = "";
        for (let i = 0; i < truncateStatLen - currentValue.toString().length; i++) {
            firstWhiteSpaces += " ";
        }

        const totalValue = maxValue + tempValue;

        let secondWhiteSpaces = "";
        for (let i = 0; i < truncateStatLen - totalValue.toString().length; i++) {
            secondWhiteSpaces += " ";
        }
        
        return firstWhiteSpaces + ansiColor + currentValue + "/" + totalValue + Colors.RESET + secondWhiteSpaces;
    }

    static createStatusSummarizedView(currentValue, maxValue, tempValue) {
        let view = `${currentValue}/${maxValue + tempValue}`;
        view += tempValue > 0 ? ` (+${tempValue}) ` : "";

        return view;
    }

    static createStatusBar(currentValue, maxValue, tempValue, barSize) {
        const progression = Math.floor((currentValue + tempValue) / (maxValue + tempValue) * barSize);

        let bar = "[";
        for (let i = 1; i <= barSize; i++) {
            bar += progression >= i ? "▬" : " ";
        }
        bar += `] ${currentValue}/${maxValue + tempValue} `;
        bar += tempValue > 0 ? ` (+${tempValue}) ` : "";

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
}

module.exports = EmbededResponseService;
