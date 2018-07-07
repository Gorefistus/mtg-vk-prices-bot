const Scry = require('scryfall-sdk');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');


function addHelpmeCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/(\[club168593903.*\].*|^)(helpme[\s]|hm[\s])/i, (message) => {
            const cardName = message.text.match(/(\[club168593903.*\].*|^)(helpme[\s]|hm[\s])(.*)/i)[3];
            if (cardName.length < 2) {
                return bot.send(STRINGS.NAME_SHORT_ERR, message.peer_id);
            }
            Scry.Cards.autoCompleteName(cardName)
                .then((results) => {
                    if (results.length > 0) {
                        let suggestions = 'Did you mean:';
                        for (let i = 0; i < 10 && i <= results.length - 1; i++) {
                            suggestions = `${suggestions}\n ${results[i]}`;
                        }
                        bot.send(suggestions, message.peer_id).catch(reason => {
                            console.log(reason);});
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
