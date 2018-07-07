const Scry = require('scryfall-sdk');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');

function sendResults(bot, message, values) {
    if (bot && message && values.length > 0) {
        let results = 'These cards match the criteria:';
        values.forEach(card => {
            results = results + `\n ${card.name}`;
        });
        bot.send(`${results}`, message.peer_id);
    } else {
        console.error('Error sending results');
    }
}


function addAdvancedSearchCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/(advancedsearch[\s]|as[\s])/i, message => {
            //VK replaces quotes "" with &quot; characters, so we replace them back again
            const searchQuery = message.text.match(/(advancedsearch[\s]|as[\s])(.*)/i)[2].replace(new RegExp('&quot;', 'g'), '"')
                .replace(new RegExp('&gt;', 'g'), '>')
                .replace(new RegExp('&lt;', 'g'), '<');
            const cardEmitter = Scry.Cards.search(`${searchQuery}`);
            const resultArray = [];
            let alreadyFired = false;
            cardEmitter.on('data', data => {
                if (resultArray.length < 10) {
                    resultArray.push(data);
                } else {
                    cardEmitter.cancel();
                }
            });

            cardEmitter.on('error', reason => {
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
                        bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                    } else {
                        sendResults(bot, message, resultArray);
                    }
                }
            });
        });
    }
}

module.exports = {
    addAdvancedSearchCommand,
};
