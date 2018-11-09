const request = require('request-promise-native');
const phantom = require('phantom');
const path = require('path');
const fs = require('fs');

const CARD_CACHE = require('../../common/CardCache');
const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


async function getCardPrices(parsedCardName, setCode, bot) {
    let priceString = '';

    const cardObject = await MISC.getMultiverseId(parsedCardName, setCode);
    priceString = `Цены на ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} [${cardObject.set_name}]:\n TCG Mid: ${cardObject.usd ? `$${cardObject.usd}` : STRINGS.NO_DATA}\n MTGO: ${cardObject.tix ? `${cardObject.tix} tix` : STRINGS.NO_DATA}`;

    let cardName = cardObject.name;
    if (cardObject.card_faces) {
        cardName = cardObject.name.split('//')[0].trim();
    }

    let image;
    try {
        const instance = await phantom.create([], {
            logLevel: 'error',
        });
        const page = await instance.createPage();
        const cardNameUrl = MISC.replaceAll(MISC.removeAllSymbols(cardName, [',', `'`]), ' ', '+');
        const cardSetUrl = MISC.replaceAll(MISC.removeAllSymbols(cardObject.set_name, [',', `'`]), ' ', '+');

        const url = `${CONSTANTS.MTGGOLDFISH_PRICE_LINK}${cardSetUrl}/${cardNameUrl}#paper`;

        await page.open(url);
        const clipRect = await page.evaluate(function () {
            return document.querySelector('#tab-paper')
                .getBoundingClientRect();
        });
        page.property('clipRect', {
            top: clipRect.top,
            left: clipRect.left,
            width: clipRect.width,
            height: clipRect.height,
        });

        const imageName = `${cardObject.set_name}${cardObject.name}${Date.now()}.png`;
        page.render(imageName);
        await instance.exit();
        image = await bot.uploadPhoto(path.resolve(imageName));
        fs.unlink(imageName, () => {
            console.log(STRINGS.LOG_FILE_DELETED);
        });
    } catch (e) {
        //do nothing
    }

    // SCG PRICES SCRAPING START
    let scgPriceObject = CARD_CACHE.getCardFromCache(cardObject, false);

    if (scgPriceObject) {
        priceString = `${priceString} \n SCG: ${scgPriceObject.value}`;
    } else {
        try {
            const starCityPage = await request(`${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=Y`);
            scgPriceObject = MISC.getStarCityPrice(starCityPage, cardObject);
            if (scgPriceObject) {
                CARD_CACHE.addCardToCache({
                    ...scgPriceObject,
                    name: cardObject.name,
                    foil: false,
                });
                priceString =
                    `${priceString} \n SCG (наличие: ${scgPriceObject.stock === 'Out of Stock' ? 'Нет в наличии' : scgPriceObject.stock})  :${scgPriceObject.set !== cardObject.set_name ? ` [${scgPriceObject.set}] ` : ''} ${scgPriceObject.value}`;
            } else {
                priceString = `${priceString} \n SCG: ${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=Y`;
            }
        } catch (e) {
            console.error('SCG REQUEST ERROR\n', e);
            priceString = `${priceString} \n SCG: ${STRINGS.PRICE_ERROR}`;
        }
    }
    // TOPDECK PRICES SCRAP START

    try {
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
            priceString = `${priceString} \n ${STRINGS.PRICES_TOPDECK}: ${filterByNameAndPrice[0].cost} RUB`;
        } else {
            const filterByName = topDeckPrices.filter(price => price.eng_name.toLowerCase() === cardName.toLowerCase());
            if (filterByName.length > 0) {
                priceString = `${priceString} \n ${STRINGS.PRICES_TOPDECK}: ${filterByName[0].cost} RUB`;
            }
        }
    } catch (e) {
        console.error('TOPDECK REQUEST ERROR\n', e);
        priceString = `${priceString} \n TopDeck: ${STRINGS.PRICE_ERROR}`;
    }
    return {
        priceString,
        image,
    };

}


function addPriceCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {

        bot.get(/([m|h][\s]price[\s]|[m|h][\s]p[\s])/i, (message) => {
            stats.track(message.user_id, { msg: message.body }, 'p');
            bot.sendTyping(message);
            let cardName = message.body.match(/([m|h][\s]price[\s]|[m|h][\s]p[\s])(.*)/i)[2];
            const setNameRegex = message.body.match(/([m|h][\s]price[\s]|[m|h][\s]p[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
            }

            getCardPrices(cardName, setCode, bot)
                .then((prices) => {
                    let attachmentString = '';
                    if (prices.image) {
                        attachmentString =
                            `${attachmentString}photo${prices.image.owner_id}_${prices.image.id},`;
                    }
                    const options = { attachment: attachmentString };

                    bot.send(prices.priceString, message.peer_id, options);
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


module.exports = addPriceCommand;
