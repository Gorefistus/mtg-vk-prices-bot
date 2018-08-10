const request = require('request-promise-native');

const CARD_CACHE = require('../../common/CardCache');
const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


async function getFoilPrices(parsedCardName, setCode) {
    const cardObject = await MISC.getMultiverseId(parsedCardName, setCode);
    let priceString = `Цены на английскую фойлу ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} [${cardObject.set_name}](ТEST COMMAND): `;


    let cardName = cardObject.name;
    if (cardObject.card_faces) {
        cardName = cardObject.name.split('//')[0].trim();
    }

    if (!cardObject.foil && cardObject.digital !== undefined && !cardObject.digital) {
        return `${cardObject.printed_name ? cardObject.printed_name : cardObject.name} не имеет ${cardObject.digital ? 'физической' : ''} фойлы в ${cardObject.set_name} (ТEST COMMAND)`;
    } else {
        let scgPriceObject = CARD_CACHE.getCardFromCache(cardObject, true);
        if (scgPriceObject) {
            priceString = `${priceString} \n SCG: ${scgPriceObject.value}`;
        } else {
            try {
                const starCityPage = await request(`${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=Y`);
                scgPriceObject = MISC.getStarCityPrice(starCityPage, cardObject, cardObject.nonfoil);
                if (scgPriceObject) {
                    CARD_CACHE.addCardToCache({
                        ...scgPriceObject,
                        name: cardObject.name,
                        foil: true,
                    });
                    priceString =
                        `${priceString} \n SCG:${scgPriceObject.set !== cardObject.set_name ? ` [${scgPriceObject.set}] ` : ''} ${scgPriceObject.value}`;
                } else {
                    priceString = `${priceString} \n SCG: ${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=Y`;
                }
            } catch (e) {
                console.error('SCG REQUEST ERROR\n', e);
                priceString = `${priceString} \n SCG: ${STRINGS.PRICE_ERROR}`;
            }
        }
    }
    return priceString;
}


function addPriceFoilCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]priceFoil[\s]|[m|h][\s]pf[\s])/i, (message) => {
            stats.track(message.user_id, { msg: message.body }, 'pf');
            let cardName = message.body.match(/([m|h][\s]priceFoil[\s]|[m|h][\s]pf[\s])(.*)/i)[2];
            const setNameRegex = message.body.match(/([m|h][\s]priceFoil[\s]|[m|h][\s]pf[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
            }


            getFoilPrices(cardName, setCode)
                .then((prices) => {
                    bot.send(prices, message.peer_id);
                }, (reason) => {
                    if (reason && reason.statusCode && reason.statusCode === 404) {
                        const options = { forward_messages: message.id };
                        return bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                    } else {
                        return bot.send(STRINGS.PRICES_ERR_GENERAL, message.peer_id);
                    }
                })
                .catch(() => {
                    return bot.send(STRINGS.PRICES_ERR_GENERAL, message.peer_id);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}

module.exports = addPriceFoilCommand;
