const request = require('request-promise-native');


const imageCache = require('../../common/imageVkCache');
const CARD_CACHE = require('../../common/cardCache');
const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addAuctionsCommand(bot, stats) {

    if (bot && typeof bot.get === 'function') {

        bot.get(new RegExp(`([${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]auctions|[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]ac)`, 'i'), async (message) => {
            stats.track(message.user_id, { msg: message.body }, 'ac');
            bot.sendTyping(message);
            const paramsFromMessage = message.body.trim()
                .match(new RegExp(`([${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]auctions[\\s]|[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]ac)(.*)`, 'i'))[2];
            if (paramsFromMessage && paramsFromMessage.length < 3) {
                return bot.send(STRINGS.ERR_QUERY_IS_TOO_SMALL, message.peer_id);
            }
            try {
                const topDeckAuctionPrices = await request({
                    method: 'GET',
                    uri: `${CONSTANTS.TOPDECK_AUCTIONS_LINK}`,
                    ecdhCurve: 'auto',
                    json: true,
                });
                topDeckAuctionPrices.sort((auc1, auc2) => {
                    if (auc1.date_estimated < auc2.date_estimated) {
                        return -1;
                    }
                    if (auc1.date_estimated > auc2.date_estimated) {
                        return 1;
                    }
                    return 0;
                });
                const filteredResults = [];
                if (paramsFromMessage) {
                    for (const auctionEntry of topDeckAuctionPrices) {
                        if (auctionEntry.lot.toLowerCase()
                            .includes(paramsFromMessage.toLowerCase())) {
                            filteredResults.push(auctionEntry);
                        }
                        if (filteredResults.length === 5) { // no more than 5 results per request
                            break;
                        }
                    }
                } else {
                    for (const auctionEntry of topDeckAuctionPrices) {
                        filteredResults.push(auctionEntry);
                        if (filteredResults.length === 5) { // no more than 5 results per request
                            break;
                        }
                    }
                }
                if (filteredResults.length === 0) {
                    return bot.send(STRINGS.ERR_AUCTIONS_NOT_FOUND, message.peer_id);
                } else {
                    console.log(filteredResults);
                    let stringToReturn = `${STRINGS.AUCTIONS_MATCH_CRITERIA}`;
                    filteredResults.forEach((res) => {
                        stringToReturn = `${stringToReturn} \n\n Лот: ${res.lot} | Текущая ставка: ${res.current_bid} | Дата окончания: ${res.date_estimated_conv} | Автор: ${res.seller.name} | Кол-во отзывов: ${res.seller.refs}`;
                    });
                    return bot.send(stringToReturn, message.peer_id);
                }
            } catch (e) {
                console.error('TOPDECK REQUEST ERROR\n', e);
            }
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addAuctionsCommand;
