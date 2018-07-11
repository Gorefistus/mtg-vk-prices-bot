const Scry = require('scryfall-sdk');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');


function addHelpmeCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]helpme[\s]|[m|h][\s]hm[\s])/i, (message) => {
            stats.track(message.user_id, { msg: message.body }, 'hm');
            const cardName = message.body.match(/([m|h][\s]helpme[\s]|[m|h][\s]hm[\s,])(.*)/i)[2];
            if (cardName.length < 2) {
                return bot.send(STRINGS.NAME_SHORT_ERR, message.peer_id);
            }
            Scry.Cards.autoCompleteName(cardName)
                .then((results) => {
                    if (results.length > 0) {
                        let suggestions = 'Возможно, вы искали это:';
                        for (let i = 0; i < 10 && i <= results.length - 1; i++) {
                            suggestions = `${suggestions}\n ${results[i]}`;
                        }
                        bot.send(suggestions, message.peer_id);
                    } else {
                        bot.send(STRINGS.SUGGESTIONS_NOT_FOUND, message.peer_id);
                    }
                }, (reason) => {
                    if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                        return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                    }
                    bot.send(STRINGS.SUGGESTIONS_NOT_FOUND, message.peer_id);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addHelpmeCommand,
};
