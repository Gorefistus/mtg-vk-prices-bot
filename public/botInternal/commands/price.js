const request = require('request-promise-native');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');

const cardCache = [];

async function getCardPrices(parsedCardName, setCode) {
    let cardIndex = -1;
    let priceString = '';

    const cardObject = await MISC.getMultiverseId(parsedCardName, setCode);
    priceString = `${cardObject.name} [${cardObject.set_name}] prices :\n TCG Mid: ${cardObject.usd ? `$${cardObject.usd}` : STRINGS.NO_DATA}\n MTGO: ${cardObject.tix ? `${cardObject.tix} tix` : STRINGS.NO_DATA}`;

    let cardName = cardObject.name;
    if (cardObject.card_faces) {
        cardName = cardObject.name.split('//')[0].trim();
    }

    // SCG PRICES SCRAPING START
    let scgPriceObject;
    cardCache.forEach((card, index) => {
        if (card.name === cardObject.name && card.set === cardObject.set_name) {
            cardIndex = index;
        }
    });
    if (cardIndex >= 0) {
        priceString = `${priceString} \n SCG: ${cardCache[cardIndex].value}`;
    } else {
        const starCityPage = await request(`${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=Y`);
        scgPriceObject = MISC.getStarCityPrice(starCityPage, cardObject);
        if (scgPriceObject) {
            cardCache.push({
                ...scgPriceObject,
                name: cardObject.name,
            });
            priceString =
                `${priceString} \n SCG:${scgPriceObject.set !== cardObject.set_name ? ` [${scgPriceObject.set}] ` : ''} ${scgPriceObject.value}`;
        } else {
            priceString = `${priceString} \n SCG: ${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=Y`;
        }
    }
    // TOPDECK PRICES SCRAP START

    const topDeckPrices = await request({
        method: 'GET',
        uri: `${CONSTANTS.TOPDECK_PRICE_LINK}${encodeURIComponent(cardName)}`,
        ecdhCurve: 'auto',
        json: true,
    });
    const filterByNameAndPrice = topDeckPrices.filter(price => {
        if (scgPriceObject) {
            const scgPriceInNumber = parseFloat(scgPriceObject.value.split('$')[1]);
            return price.eng_name.toLowerCase() === cardName.toLowerCase() && price.cost > scgPriceInNumber * 25;
        }
        return price.eng_name.toLowerCase() === cardName.toLowerCase();
    });
    if (filterByNameAndPrice.length > 0) {
        priceString = `${priceString} \n TopDeck(unknown edition): ${filterByNameAndPrice[0].cost} RUB`;
    } else {
        const filterByName = topDeckPrices.filter(price => price.eng_name.toLowerCase() === cardName.toLowerCase());
        if (filterByName.length > 0) {
            priceString = `${priceString} \n TopDeck(unknown edition): ${filterByName[0].cost} RUB`;
        }
    }
    return priceString;

}


function addPriceCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]price[\s]|[m|h][\s]p[\s])/i, (message) => {
            let cardName = message.body.match(/([m|h][\s]price[\s,]|[m|h][\s]p[\s])(.*)/i)[2];
            const setNameRegex = message.body.match(/([m|h][\s]price[\s,]|[m|h][\s]p[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
            }

            getCardPrices(cardName, setCode)
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


module.exports = {
    addPriceCommand,
};
