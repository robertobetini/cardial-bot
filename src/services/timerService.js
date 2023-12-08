const userDAO = require("./../DAOs/userDAO");
const User = require("../models/user");

const MINUTE_IN_MILLIS = 60 * 1000;
const HOUR_IN_MILLIS = 60 * MINUTE_IN_MILLIS;
const DAY_IN_MILLIS = 24 * HOUR_IN_MILLIS;

class TimerService {
    static async addSilenceTime(guildId, discordUser, days, hours, minutes) {
        let user = await userDAO.get(discordUser.id, guildId);

        const now = new Date().getTime();
        if (!user) {
            user = new User(
                discordUser.id,
                guildId,
                discordUser.username
            );
        }

        if (!user.silenceEndTime) {
            user.silenceEndTime = now;
        }

        user.silenceEndTime += this.getTimeSpanInMillis(days, hours, minutes);

        await userDAO.upsert(user);
    }

    static async removeSilenceTime(guildId, discordUser, days, hours, minutes) {
        let user = await userDAO.get(discordUser.id, guildId);

        const now = new Date().getTime();
        if (!user) {
            user = new User(
                discordUser.id,
                guildId,
                discordUser.username
            );
        }

        if (!user.silenceEndTime) {
            user.silenceEndTime = now;
        }

        user.silenceEndTime -= this.getTimeSpanInMillis(days, hours, minutes);
        if (user.silenceEndTime < now) {
            user.silenceEndTime = now;
        }

        await userDAO.upsert(user);
    }

    static getTimeSpanInMillis(days, hours, minutes) {
        return (days * DAY_IN_MILLIS)
        + (hours * HOUR_IN_MILLIS)
        + (minutes * MINUTE_IN_MILLIS);
    }
}

module.exports = TimerService;
