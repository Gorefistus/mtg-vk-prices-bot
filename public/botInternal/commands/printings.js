const request = require('request-promise-native');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addPrintingsCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]printings[\s]|[m|h][\s]pr[\s])/i, (message) => {
            const cardName = message.body.match(/([m|h][\s]printings[\s]|[m|h][\s]pr[\s,])(.*)/i)[2];
            MISC.getMultiverseId(cardName)
                .then((value) => {
                    request({
                        uri: value.prints_search_uri,
                        json: true,
                    })
                        .then((printings) => {
                            let printingsString = `Up to 10 printings of ${value.name}: \n`;
                            for (let i = 0; i < 10 && i < printings.data.length; i++) {
                                printingsString = `${printingsString}${printings.data[i].set_name} (${printings.data[i].set.toUpperCase()})\n`;
                            }
                            return bot.send(printingsString, message.peer_id);
                        }, (reason) => {
                            if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                                return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                            }
                            const options = { forward_messages: message.id };
                            bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                        });
                }, (reason) => {
                    if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                        return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                    }
                    const options = { forward_messages: message.id };
                    bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}

module.exports = {
    addPrintingsCommand,
};
