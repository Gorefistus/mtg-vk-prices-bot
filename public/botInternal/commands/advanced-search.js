const Scry = require('scryfall-sdk');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');

function addAdvancedSearchCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]advancedsearch[\s]|[m|h][\s]as[\s])/i, message => {
            const searchQuery = message.body.match(/([m|h][\s]advancedsearch[\s]|[m|h][\s]as[\s])(.*)/i)[2];
            Scry.Cards.search(searchQuery)
                .waitForAll()
                .then((values) => {
                    console.log(values);
                }, reason => {
                    if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                        return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                    }
                    const options = { forward_messages: message.id };
                    bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                });
        });
    }
}

module.exports = {
    addAdvancedSearchCommand,
};
