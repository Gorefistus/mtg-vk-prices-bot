const MISC = require('../../common/misc');
const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');

function addTranslationsCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([n|h][\s]translations[\s]|[n|h][\s]tr[\s])/i, (message) => {
            const cardName = message.text.match(/([n|h][\s]translations[\s]|[n|h][\s]tr[\s,])(.*)/i)[2];
            MISC.getMultiverseId(cardName)
                .then(value => {
                    console.log(value);
                }, (reason) => {
                    if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                        return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                    }
                    const options = { forward_messages: message.id };
                    return bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                });
        });
    }
}


module.exports = {
    addTranslationsCommand,
};
