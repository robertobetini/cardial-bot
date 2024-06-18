const userDAO = require("./../DAOs/userDAO");
const UserService = require("../services/userService");
const Constants = require("../constants");

class TimerService {
    static async addSilenceTime(guildId, discordUser, days, hours, minutes) {
        let user = await UserService.getOrCreateUser(guildId, discordUser);
        if (!user.silenceEndTime) {
            user.silenceEndTime = now;
        }

        user.silenceEndTime += this.getTimeSpanInMillis(days, hours, minutes);

        await userDAO.upsert(user);
    }

    static async removeSilenceTime(guildId, discordUser, days, hours, minutes) {
        let user = await UserService.getOrCreateUser(guildId, discordUser);
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
        return (days * Constants.DAY_IN_MILLIS)
        + (hours * Constants.HOUR_IN_MILLIS)
        + (minutes * Constants.MINUTE_IN_MILLIS);
    }
}

module.exports = TimerService;
