const Logger = require("../logger");

const commandRefs = {
    drop: require("../commands/combat/getDropsCommand")
};

module.exports = {
    handleAsync: async (pollAnswer, isVoteRemove) => {
        const [command, executionId, pollId] = pollAnswer.poll.message.content.split("-");
        if (!executionId || !pollId) {
            return;
        }

        Logger.debug(`Processing poll handler: ${command}-${executionId}-${pollId}`);
        await commandRefs[command].pollHandler(pollAnswer, executionId, pollId, isVoteRemove);
    }
}