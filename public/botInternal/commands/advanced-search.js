const Scry = require('scryfall-sdk');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');

function sendResults(bot, message, values, page) {
    if (bot && message && values.length > 0) {
        const pages = Math.ceil(values.length / 10);
        let results = '';
        if (page > 0 && page <= pages) {
            results = `${STRINGS.CARDS_MATCH_CRITERIA}(Страница: ${page}/${pages}):`;
            const startIndex = (page - 1) * 10;
            for (let i = startIndex; i < ((page - 1) * 10) + 10 && i < values.length; i++) {
                results = results + `\n ${values[i].name}`;
            }
        } else {
            results = `${STRINGS.CARDS_MATCH_CRITERIA} (Страница: 1/${pages}):`;
            for (let i = 0; i < 10 && i < values.length; i++) {
                results = results + `\n ${values[i].name}`;
            }
        }
        bot.send(results, message.peer_id);
    } else {
        console.error('Error sending results');
    }
}


function addAdvancedSearchCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        const advancedSearchRegexp = new RegExp(`${CONSTANTS.BOT_PREFIX_GROUP}[${CONSTANTS.BOT_PREFIX_ENDINGS}]? ?\\b(advancedsearch|as) (.*)`, 'im');
        bot.get(advancedSearchRegexp, (message) => {
            stats.track(message.from_id, { msg: message.text }, 'as');
            bot.sendTyping(message);
            //VK replaces quotes "" with &quot; characters, so we replace them back again
            let searchQuery = message.text.match(advancedSearchRegexp)[3].replace(new RegExp('&quot;', 'g'), '"')
                .replace(new RegExp('&gt;', 'g'), '>')
                .replace(new RegExp('&lt;', 'g'), '<');
            let page = 0;
            if (searchQuery.split('|').length > 1) {
                const tempValue = searchQuery.split('|');
                searchQuery = tempValue[0];
                page = parseInt(tempValue[1], 10);
            }
            const cardEmitter = Scry.Cards.search(`${searchQuery}`);
            const resultArray = [];
            let alreadyFired = false;
            cardEmitter.on('data', (data) => {
                if (resultArray.length < 100) {
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
                    sendResults(bot, message, resultArray, page);
                }
            });

            cardEmitter.on('end', () => {
                if (!alreadyFired) {
                    alreadyFired = true;
                    if (resultArray.length === 0) {
                        bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id);
                    } else {
                        sendResults(bot, message, resultArray, page);
                    }
                }
            });
        });
    }
}

module.exports = addAdvancedSearchCommand;
