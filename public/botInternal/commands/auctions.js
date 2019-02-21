const request = require('request-promise-native');
const moment = require('moment');
moment.locale('ru');

const imageCache = require('../../common/imageVkCache');
const CARD_CACHE = require('../../common/cardCache');
const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addAuctionsCommand(bot, stats) {

    if (bot && typeof bot.get === 'function') {
        const auctionsRegexp = new RegExp(`${CONSTANTS.BOT_PREFIX_GROUP}[${CONSTANTS.BOT_PREFIX_ENDINGS}] (auctions|ac) (.*)`, 'im');

        bot.get(auctionsRegexp, async (message) => {
            stats.track(message.user_id, { msg: message.text }, 'ac');
            bot.sendTyping(message);
            const paramsFromMessage = message.text.trim()
                .match(auctionsRegexp)[3].trim();
            if (paramsFromMessage && paramsFromMessage.length < 3) {
                return bot.send(STRINGS.ERR_QUERY_IS_TOO_SMALL, message.peer_id);
            }
            let stringToReturn = '';

            // TopDeck current auctions prices GET
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
                if (filteredResults.length > 0) {
                    stringToReturn = `${STRINGS.AUCTIONS_MATCH_CRITERIA}`;
                    filteredResults.forEach((res) => {
                        stringToReturn = `${stringToReturn} \n Лот: ${res.lot} | Текущая ставка: ${res.current_bid} | Дата окончания: ${moment.unix(res.date_estimated)
                            .format(CONSTANTS.MOMENT_AUCTIONS_FORMAT)}`;
                    });
                }
            } catch (e) {
                console.error('TOPDECK REQUEST ERROR\n', e);
            }

            try {
                if (paramsFromMessage) {
                    const auctionsLink = `${CONSTANTS.TOPDECK_AUCTIONS_FINISHED_SEARCH_LINK}${encodeURIComponent(paramsFromMessage)}`;
                    const topDeckAuctionPrices = await request({
                        method: 'GET',
                        uri: auctionsLink,
                        ecdhCurve: 'auto',
                        json: true,
                    });
                    if (topDeckAuctionPrices.auctions.length > 0) {
                        stringToReturn = `${stringToReturn} \n\n ${STRINGS.AUCTIONS_ENDED_MATCH_CRITERIA}: `;
                        topDeckAuctionPrices.auctions.forEach((auc, index) => {
                            if (index < 5) {
                                stringToReturn = `${stringToReturn} \n Лот: ${auc.lot} |  Финальная ставка: ${auc.winning_bid} | Дата окончания: ${moment.unix(auc.date_ended).format(CONSTANTS.MOMENT_AUCTIONS_FORMAT)} `;
                            }
                        });
                    }
                }
            } catch (e) {
                console.error('TOPDECK REQUEST ERROR\n', e);
            }

            return bot.send(stringToReturn, message.peer_id);
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addAuctionsCommand;
