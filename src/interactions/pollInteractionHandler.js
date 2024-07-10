const Logger = require("../logger");

const commandRefs = {
    drop: require("../commands/combat/getDropsCommand")
};

module.exports = {
    handleAsync: async (pollAnswer, isVoteRemove) => {
        const [command, pollId] = pollAnswer.poll.message.content.split("-");

        Logger.debug(`Processing poll handler: ${command}-${pollId}`);
        await commandRefs[command].pollHandler(pollAnswer, pollId, isVoteRemove);
    }
}