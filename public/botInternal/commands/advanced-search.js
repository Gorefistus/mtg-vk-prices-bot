const Scry = require('scryfall-sdk');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');

function sendResults(bot, message, values) {
    if (bot && message && values.length > 0) {
        let results = 'I found this cards matching the criteria:';
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
        bot.get(/([m|h][\s]advancedsearch[\s]|[m|h][\s]as[\s])/i, message => {
            const searchQuery = message.body.match(/([m|h][\s]advancedsearch[\s]|[m|h][\s]as[\s])(.*)/i)[2];
            const cardEmitter = Scry.Cards.search(searchQuery);
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
                if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
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
                    sendResults(bot, message, resultArray);
                }
            });
        });
    }
}

module.exports = {
    addAdvancedSearchCommand,
};
