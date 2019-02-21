const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addLegalityCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        const legalitydRegexp = new RegExp(`${CONSTANTS.BOT_PREFIX_GROUP}[${CONSTANTS.BOT_PREFIX_ENDINGS}] (legality|l) (.*)`, 'im');

        bot.get(legalitydRegexp, (message) => {
            stats.track(message.user_id, { msg: message.text }, 'l');
            bot.sendTyping(message);
            const cardName = message.text.match(legalitydRegexp)[3];
            MISC.getMultiverseId(cardName)
                .then((cardObject) => {
                    bot.send(`Легальность ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} в форматах:\n 
        ${STRINGS.FORMAT_STANDARD}: ${MISC.getLegality(cardObject.legalities.standard)}
        ${STRINGS.FORMAT_MODERN}: ${MISC.getLegality(cardObject.legalities.modern)}
        ${STRINGS.FORMAT_LEGACY}: ${MISC.getLegality(cardObject.legalities.legacy)}
        ${STRINGS.FORMAT_PAUPER}: ${MISC.getLegality(cardObject.legalities.pauper)}
        ${STRINGS.FORMAT_PENNY}: ${MISC.getLegality(cardObject.legalities.penny)}
        ${STRINGS.FORMAT_COMMANDER}: ${MISC.getLegality(cardObject.legalities.commander)}
        ${STRINGS.FORMAT_MTGO_COMMANDER}: ${MISC.getLegality(cardObject.legalities['1v1'])}
        ${STRINGS.FORMAT_VINTAGE}: ${MISC.getLegality(cardObject.legalities.vintage)}`, message.peer_id);
                }, (reason) => {
                    if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                        return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                    }
                    const options = { forward_messages: message.id };
                    return bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addLegalityCommand;
