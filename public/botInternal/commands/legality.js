const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addLegalityCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/(\[club168593903.*\].*|^)(legality[\s]|l[\s])/i, (message) => {
            const cardName = message.text.match(/(\[club168593903.*\].*|^)(legality[\s]|l[\s])(.*)/i)[3];
            MISC.getMultiverseId(cardName).then((value) => {
                bot.send(`${value.name} legality:\n 
        ${STRINGS.FORMAT_STANDARD}: ${MISC.getLegality(value.legalities.standard)}
        ${STRINGS.FORMAT_MODERN}: ${MISC.getLegality(value.legalities.modern)}
        ${STRINGS.FORMAT_LEGACY}: ${MISC.getLegality(value.legalities.legacy)}
        ${STRINGS.FORMAT_PAUPER}: ${MISC.getLegality(value.legalities.pauper)}
        ${STRINGS.FORMAT_COMMANDER}: ${MISC.getLegality(value.legalities.commander)}
        ${STRINGS.FORMAT_VINTAGE}: ${MISC.getLegality(value.legalities.vintage)}`, message.peer_id);
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
    addLegalityCommand,
};
