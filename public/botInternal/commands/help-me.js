const Scry = require('scryfall-sdk');
const franc = require('franc');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');


function sendResults(bot, message, values) {
    if (bot && message && values.length > 0) {
        let resultString = 'Возможно, вы искали эти карты:\n';
        for (let card of values) {
            resultString += `${card.printed_name ? card.printed_name : card.name}\n`;
        }
        bot.send(resultString, message.peer_id);
    } else {
        console.error('Error sending results');
    }
}


function addHelpmeCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]helpme[\s]|[m|h][\s]hm[\s])/i, (message) => {
            stats.track(message.user_id, { msg: message.body }, 'hm');
            const cardName = message.body.match(/([m|h][\s]helpme[\s]|[m|h][\s]hm[\s,])(.*)/i)[2].trim();
            if (cardName.length < 2) {
                return bot.send(STRINGS.NAME_SHORT_ERR, message.peer_id);
            }
            const lang = franc(cardName, {
                minLength: 3,
                whitelist: [CONSTANTS.LANG_ENG, CONSTANTS.LANG_RUS],
            });
            const cardEmitter = Scry.Cards.search(`${cardName} lang:${lang}`);
            const resultArray = [];
            let alreadyFired = false;
            cardEmitter.on('data', data => {
                if (resultArray.length < 15) {
                    resultArray.push(data);
                } else {
                    cardEmitter.cancel();
                }
            });

            cardEmitter.on('error', (reason) => {
                if (reason && reason.error && CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                    return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                }
                const options = { forward_messages: message.id };
                bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
            });

            cardEmitter.on('cancel', () => {
                if (!alreadyFired) {
                    alreadyFired = true;
                    sendResults(bot, message, resultArray);
                }
            });

            cardEmitter.on('end', () => {
                if (!alreadyFired) {
                    alreadyFired = true;
                    if (resultArray.length === 0) {
                        bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id);
                    } else {
                        sendResults(bot, message, resultArray);
                    }
                }
            });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addHelpmeCommand,
};
