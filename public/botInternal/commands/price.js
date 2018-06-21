const request = require('request-promise-native');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');

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
            let cardObject;
            MISC.getMultiverseId(cardName, setCode)
                .then((value) => {
                    cardObject = value;
                    cardString = `${value.name} [ ${value.set_name} ] prices :\n TCG Mid: ${value.usd ? `$${value.usd}` : STRINGS.NO_DATA} \n MTGO: ${value.tix ? `${value.tix} tix` : STRINGS.NO_DATA}`;
                    let cardIndex = -1;
                    cardCache.forEach((card, index) => {
                        if (card.name === value.name && card.set === value.set_name) {
                            cardIndex = index;
                        }
                    });
                    if (cardIndex >= 0) {
                        bot.send(`${cardString} \n SCG: ${cardCache[cardIndex].value}`, message.peer_id);
                    } else {
                        let cardName = value.name;
                        if (value.card_faces) {
                            cardName = value.name.split('//')[0].trim();
                        }
                        return request(`${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=Y`);
                    }
                }, (reason) => {
                    if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                        return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                    }
                    const options = { forward_messages: message.id };
                    bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                })
                .then((value) => {
                    const starcityPrice = MISC.getStarCityPrice(value, cardObject);
                    if (starcityPrice) {
                        cardCache.push(starcityPrice);
                        cardString = `${cardString} \n SCG: ${starcityPrice.value}`;
                    } else {
                        cardString = `${cardString} \n SCG: ${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardObject.name)}&auto=Y`;
                    }
                    let cardName = cardObject.name;
                    if (cardObject.card_faces) {
                        cardName = cardObject.name.split('//')[0].trim();
                    }
                    console.log(cardName);
                    return request({
                        method: 'GET',
                        uri: `${CONSTANTS.TOPDECK_PRICE_LINK}${encodeURIComponent(cardName)}`,
                        ecdhCurve: 'auto',
                        json: true,
                    });
                }, () => {
                    bot.send(`${cardString} \n SSG: ${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardObject.name)}&auto=y`, message.peer_id);
                })
                .then((topdeckResult) => {
                    try {
                        const filteredByQuantity = topdeckResult.filter((price) => {
                            return price.qty > 1 && price.name.toLowerCase() === cardObject.name.toLowerCase();
                        });
                        if (filteredByQuantity.length > 0) {
                            bot.send(`${cardString} \n TopDeck(unknown edition): ${filteredByQuantity[0].cost} RUB`, message.peer_id);
                        } else {
                            const filterByName = topdeckResult.filter(price => {
                                return price.name.toLowerCase() === cardObject.name.toLowerCase();
                            });
                            if (filterByName.length > 0) {
                                bot.send(`${cardString} \n TopDeck(unknown edition): ${filterByName[0].cost} RUB`, message.peer_id);
                            } else {
                                throw false;
                            }
                        }
                    } catch (e) {
                        bot.send(`${cardString}`, message.peer_id);
                    }
                }, () => {
                    console.log(`Couldn't find card on topdeck`);
                    bot.send(`${cardString}`, message.peer_id);
                })
                .catch((reason) => {
                    // do nothing
                    console.log(reason);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addPriceCommand,
};
