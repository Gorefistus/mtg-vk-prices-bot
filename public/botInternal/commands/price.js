const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');
const request = require('request-promise-native');
const cheerio = require('cheerio');


function addPriceCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([n|h][\s]price[\s]|[n|h][\s]p[\s])/i, (message) => {
            let cardName = message.body.match(/([n|h][\s]price[\s,]|[n|h][\s]p[\s])(.*)/i)[2];
            const setNameRegex = message.body.match(/([n|h][\s]price[\s,]|[n|h][\s]p[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
            }

            let cardString = '';
            MISC.getMultiverseId(cardName, setCode).then((value) => {
                cardString = `${value.name} prices :\n TCG Mid: ${value.usd ? `$${value.usd}` : STRINGS.NO_DATA} \n MTGO: ${value.tix ? `${value.tix} tix` : STRINGS.NO_DATA}`;
                return request(`${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(value.name)}&auto=y`);
            }, (reason) => {
                if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                    return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                }
                const options = {forward_messages: message.id};
                bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
            }).then(value => {
                const htmlPage = cheerio.load(value);
                const SSGEdition = htmlPage('.search_results_2').first().text();
                const SSGPrice = htmlPage('.search_results_9').first().text();
                if (SSGEdition.length > 0 && SSGPrice.length > 0) {
                    bot.send(`${cardString} \n SSG: ${SSGPrice} ${SSGEdition}`, message.peer_id);
                }

            }, reason => {
                bot.send(`${cardString} \n SSG: ${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(value.name)}&auto=y`, message.peer_id);
            });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addPriceCommand,
};
