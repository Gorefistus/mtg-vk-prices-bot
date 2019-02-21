const request = require('request-promise-native');

const CARD_CACHE = require('../../common/cardCache');
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
        let scgPriceObject;
        try {
            scgPriceObject = await CARD_CACHE.getCardFromCache(cardObject, true);
        } catch (e) {
            console.log(e);
        }
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
        const priceFoilRegexp = new RegExp(`${CONSTANTS.BOT_PREFIX_GROUP}[${CONSTANTS.BOT_PREFIX_ENDINGS}] (priceFoil|pf) (.*)`, 'im');

        bot.get(priceFoilRegexp, (message) => {

            stats.track(message.user_id, { msg: message.text }, 'pf');
            bot.sendTyping(message);
            let cardName = message.text.match(priceFoilRegexp)[3];
            const setNameRegex = message.text.match(new RegExp(`${CONSTANTS.BOT_PREFIX_GROUP}[${CONSTANTS.BOT_PREFIX_ENDINGS}] (priceFoil|pf) (.*)\\[(.{3,4})\\]`, 'i'));
            const setCode = setNameRegex !== null ? setNameRegex[4] : undefined;
            if (setCode) {
                cardName = setNameRegex[3];
            }

            getFoilPrices(cardName, setCode)
                .then((prices) => {
                    setTimeout(() => {
                        bot.send(prices, message.peer_id);
                    }, 5000);
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
