const request = require('request-promise-native');
const createPhantomPool = require('phantom-pool');
const path = require('path');
const fs = require('fs');

const CARD_CACHE = require('../../common/CardCache');
const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


async function getCardPrices(parsedCardName, setCode, bot, pool) {
    let priceString = '';

    const cardObject = await MISC.getMultiverseId(parsedCardName, setCode);
    priceString = `Цены на ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} [${cardObject.set_name}]:\n TCG Mid: ${cardObject.usd ? `$${cardObject.usd}` : STRINGS.NO_DATA}\n MTGO: ${cardObject.tix ? `${cardObject.tix} tix` : STRINGS.NO_DATA}`;

    let cardName = cardObject.name;
    if (cardObject.card_faces) {
        cardName = cardObject.name.split('//')[0].trim();
    }

    let image;
    try {
       const imageName = await pool.use(async (instance) => {
            const page = await instance.createPage();
            const cardNameUrl = MISC.replaceAll(MISC.removeAllSymbols(cardName, [',', `'`]), ' ', '+');
            const cardSetUrl = MISC.replaceAll(MISC.removeAllSymbols(cardObject.set_name, [',', `'`]), ' ', '+');
            const url = `${CONSTANTS.MTGGOLDFISH_PRICE_LINK}${cardSetUrl}/${cardNameUrl}#paper`;

            const status = await page.open(url);
            if (status !== 'success') {
                throw new Error(`cannot open ${url}`);
            }
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
            const imageNamePromise = `${cardObject.set_name}${cardObject.name}${Date.now()}.png`;
            await page.render(imageNamePromise);
            return imageNamePromise;
        });

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
                    `${priceString} \n SCG:${scgPriceObject.set !== cardObject.set_name ? ` [${scgPriceObject.set}] ` : ''} ${scgPriceObject.value}`;
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
            priceString = `${priceString} \n TopDeck(неизвестное издание): ${filterByNameAndPrice[0].cost} RUB`;
        } else {
            const filterByName = topDeckPrices.filter(price => price.eng_name.toLowerCase() === cardName.toLowerCase());
            if (filterByName.length > 0) {
                priceString = `${priceString} \n TopDeck(неизвестное издание): ${filterByName[0].cost} RUB`;
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
        const pool = createPhantomPool({
            max: 10, // default
            min: 2, // default
            // how long a resource can stay idle in pool before being removed
            idleTimeoutMillis: 30000, // default.
            // maximum number of times an individual resource can be reused before being destroyed; set to 0 to disable
            maxUses: 50, // default
            // function to validate an instance prior to use; see https://github.com/coopernurse/node-pool#createpool
            validator: () => Promise.resolve(true), // defaults to always resolving true
            // validate resource before borrowing; required for `maxUses and `validator`
            testOnBorrow: true, // default
            // For all opts, see opts at https://github.com/coopernurse/node-pool#createpool
            phantomArgs: [['--ignore-ssl-errors=true', '--disk-cache=true'], {
                logLevel: 'debug',
            }], // arguments passed to phantomjs-node directly, default is `[]`. For all opts, see https://github.com/amir20/phantomjs-node#phantom-object-api
        });


        bot.get(/([m|h][\s]price[\s]|[m|h][\s]p[\s])/i, (message) => {
            stats.track(message.user_id, { msg: message.body }, 'p');
            let cardName = message.body.match(/([m|h][\s]price[\s]|[m|h][\s]p[\s])(.*)/i)[2];
            const setNameRegex = message.body.match(/([m|h][\s]price[\s]|[m|h][\s]p[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
            }

            getCardPrices(cardName, setCode, bot, pool)
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
