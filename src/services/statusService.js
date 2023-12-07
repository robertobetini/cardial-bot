const userDAO = require("./../DAOs/userDAO");
const expCalculator = require("../expCalculator");
const User = require("../models/user");

const COLUMN_SIZE = 20;

class StatusService {
    static async getExpLeaderboard(guildId) {
        const users =  await userDAO.getAll(guildId, "totalExp");

        let leaderboard = this.createTable(
            [ "User", "Level", "EXP" ], 
            users.map(user => [ user.username, user.lvl.toString(), user.exp.toString() ]));

        return leaderboard;
    }

    static async getGoldLeaderboard(guildId) {
        const users = await userDAO.getAll(guildId, "gold");

        let leaderboard = this.createTable(
            [ "User", "GOLD" ], 
            users.map(user => [ user.username, `$${user.gold}` ]));

        return leaderboard;
    }

    static async getUserStatus(guildId, discordUser, expBarSize = 16) {
        let user = await userDAO.get(discordUser.id, guildId);

        if (!user) {
            user = new User(
                discordUser.id,
                guildId,
                discordUser.username
            );

            await userDAO.upsert(user);
        }
        
        const maxLvlExp = expCalculator.getLevelExp(user.lvl)
        const progression = Math.floor(user.exp / maxLvlExp * expBarSize);

        let expBar = "";
        for (let i = 1; i <= expBarSize; i++) {
            expBar += progression >= i ? "/" : "-";
        }

        return "```r\n" +
        `User:    ${user.username}\n` +
        `Level:   ${user.lvl}\n` +
        `EXP:     ${user.exp}/${maxLvlExp} [${expBar}]\n` +
        `Banco:   $${user.gold}\n\n` +
        `Ocupado: TODO` + 
        "```";
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
}

module.exports = StatusService;