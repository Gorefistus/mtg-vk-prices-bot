const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');


function addMiscCommands(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        bot.on('poll-error', (error) => {
            console.log(error);
        });

        bot.on('command-notfound', (msg) => {
            if (msg.fwd_messages && msg.fwd_messages.length === 0) {
                if (msg.id === 0 && (!msg.text.startsWith('!') || !msg.text.includes('club168593903'))) {
                    return;
                }
                stats.track(msg.user_id, { msg: msg.body }, 'uc');
                bot.send(STRINGS.COMMAND_NOT_FOUND, msg.peer_id);
            }
        });

    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addMiscCommands;
