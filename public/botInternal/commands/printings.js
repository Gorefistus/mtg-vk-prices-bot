const request = require('request-promise-native');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addPrintingsCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]printings[\s]|[m|h][\s]pr[\s])/i, (message) => {
            stats.track(message.user_id, { msg: message.body }, 'pr');
            let pageName = 0;
            let cardName = message.body.match(/([m|h][\s]printings[\s]|[m|h][\s]pr[\s,])(.*)/i)[2];
            if (cardName.split('|').length > 1) {
                const tempValue = cardName.split('|');
                cardName = tempValue[0];
                pageName = parseInt(tempValue[1]);
            }
            MISC.getMultiverseId(cardName)
                .then((value) => {
                    request({
                        uri: value.prints_search_uri,
                        json: true,
                    })
                        .then((printings) => {
                            let printingsString = '';
                            if (printings.data && printings.data.length > 10) {
                                const pages = Math.ceil(printings.data.length / 10);
                                if (pageName > 0 && pageName <= pages) {
                                    const startIndex = (pageName - 1) * 10;
                                    let endIndex = 0;
                                    for (let i = startIndex; i < ((pageName - 1) * 10) + 10 && i < printings.data.length; i++) {
                                        printingsString = `${printingsString}${printings.data[i].set_name} (${printings.data[i].set.toUpperCase()})\n`;
                                        endIndex = i;
                                    }
                                    const totalPrintingsShown = endIndex - startIndex + 1;
                                    printingsString = `${totalPrintingsShown} изданий (всего ${printings.data.length}) ${value.name} (Страница ${pageName}/${pages}): \n${printingsString}`;
                                } else {
                                    printingsString =
                                        `10 изданий (всего ${printings.data.length}) ${value.name} (Страница 1/${pages}):\n`;
                                    for (let i = 0; i < 10 && i < printings.data.length; i++) {
                                        printingsString =
                                            `${printingsString}${printings.data[i].set_name} (${printings.data[i].set.toUpperCase()})\n`;
                                    }
                                }
                            } else {
                                printingsString = `${printings.data.length} изданий (всего ${printings.data.length}) ${value.name}: \n`;
                                for (let i = 0; i < 10 && i < printings.data.length; i++) {
                                    printingsString = `${printingsString}${printings.data[i].set_name} (${printings.data[i].set.toUpperCase()})\n`;
                                }
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
