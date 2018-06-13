const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');
const request = require('request-promise-native');
const cheerio = require('cheerio');

const cardCache = [];

function addPriceCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]price[\s]|[m|h][\s]p[\s])/i, (message) => {
            let cardName = message.body.match(/([m|h][\s]price[\s,]|[m|h][\s]p[\s])(.*)/i)[2];
            const setNameRegex = message.body.match(/([m|h][\s]price[\s,]|[m|h][\s]p[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
            }

            let cardString = '';
            let properCardName = '';
            MISC.getMultiverseId(cardName, setCode)
                .then((value) => {
                    properCardName = value.name;
                    cardString = `${value.name} prices :\n TCG Mid: ${value.usd ? `$${value.usd}` : STRINGS.NO_DATA} \n MTGO: ${value.tix ? `${value.tix} tix` : STRINGS.NO_DATA}`;
                    let cardIndex = -1;
                    cardCache.forEach((card, index) => {
                        if (card.name === value.name) {
                            cardIndex = index;
                        }
                    });
                    if (cardIndex >= 0) {
                        bot.send(`${cardString} \n SCG: ${cardCache[cardIndex].value}`, message.peer_id);
                    } else {
                        return request(`${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(value.name)}&auto=y`);
                    }
                }, (reason) => {
                    if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                        return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                    }
                    const options = { forward_messages: message.id };
                    bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                })
                .then(value => {
                    const htmlPage = cheerio.load(value);
                    const SCGEdition = htmlPage('.search_results_2')
                        .first()
                        .text();
                    const SCGPrice = htmlPage('.search_results_9')
                        .first()
                        .text();
                    if (SCGEdition.length > 0 && SCGPrice.length > 0) {
                        cardCache.push({
                            name: properCardName,
                            value: SCGPrice,
                        });
                        bot.send(`${cardString} \n SCG: ${SCGPrice}`, message.peer_id);
                    } else {
                        bot.send(`${cardString} \n SCG: ${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=y`, message.peer_id);

                    }

                }, reason => {
                    bot.send(`${cardString} \n SSG: ${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=y`, message.peer_id);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addPriceCommand,
};
