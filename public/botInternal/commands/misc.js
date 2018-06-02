const STRINGS = require('../../common/strings');

function addMiscCommands(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.on('poll-error', (error) => {
            console.log(error);
        });

        bot.on('command-notfound', (msg) => {
            bot.send(STRINGS.COMMAND_NOT_FOUND, msg.peer_id);
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}

module.exports = {
    addMiscCommands,
};
