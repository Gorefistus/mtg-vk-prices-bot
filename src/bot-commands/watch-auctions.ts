import BasicCommand from './basic-command';
import VK, { MessageContext } from 'vk-io';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { AUCTIONS, ERRORS } from '../utils/strings';
import AuctionsHelper from '../utils/database/auctions-helper';


export default class WatchAuctionsCommand extends BasicCommand {

    fullName: string; // watchAuctions
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string;  // wa
    vkBotApi: VK;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.fullName = 'watchAuctions';
        this.shortName = 'wa';
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = new RegExp(`^(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX}?)(${this.shortName}|${this.fullName}) (.*)?`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})(${this.shortName}|${this.fullName}) (.*)?`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    async processCommand(msg: MessageContext): Promise<any> {
        if (PEER_TYPES.GROUP === msg.peerType) {
            return this.processError(msg, ERRORS.AUCTIONS_WATCH_GROUP);
        }

        const auctionQuery = msg.text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3].trim();


        try {
            const user = await AuctionsHelper.getItem({userId: msg.senderId});

            if (auctionQuery.startsWith('-l')) {
                if (user && user.watchlist.length > 0) {
                    let responseString = `${AUCTIONS.QUERY_TRACKED}\n`;
                    user.watchlist.forEach((watchlistValue, index) => {
                        responseString = `${responseString} ${index + 1}) ${watchlistValue} \n`;
                    });
                    return msg.send(responseString);
                }
                return msg.send(AUCTIONS.WATCHED_AUCTIONS_EMPTY);
            }

            if (auctionQuery.startsWith('-r ')) {
                if (user) {
                    if (user.watchlist.length === 0) {
                        return msg.send(AUCTIONS.WATCHED_AUCTIONS_EMPTY);
                    }
                    const indexToRemove = Number.parseInt(auctionQuery.replace('-r', ''), 10);
                    if (indexToRemove > 0 && indexToRemove <= user.watchlist.length) {
                        const deletedWatchlistValue = user.watchlist.splice(indexToRemove - 1, 1);
                        user.foundAuctions = user.foundAuctions.filter((value => value.id !== indexToRemove - 1));
                        const isSucc = await AuctionsHelper.updateItem({userId: msg.senderId}, {
                            $set: {
                                watchlist: user.watchlist,
                                foundAuctions: user.foundAuctions,
                                cacheDate: Date.now()
                            }
                        });
                        if (isSucc) {
                            return msg.send(`${AUCTIONS.QUERY} "${deletedWatchlistValue}" ${AUCTIONS.NOT_TRACKED}`);
                        } else {
                            return this.processError(msg);
                        }
                    }
                    return this.processError(msg, ERRORS.AUCTIONS_DELETION_WRONG_INDEX);
                }
                return msg.send(AUCTIONS.WATCHED_AUCTIONS_EMPTY);
            }

            if (user) {
                if (user.watchlist.length > 4) {
                    return this.processError(msg, ERRORS.AUCTIONS_TOO_MUCH);
                }
                if (auctionQuery.length < 4) {
                    return this.processError(msg, ERRORS.AUCTIONS_QUERY_TOO_SHORT);
                }
                // @ts-ignore
                if (user.watchlist.includes(auctionQuery)) {
                    return this.processError(msg, ERRORS.AUCTIONS_QUERY_ALREADY_PRESENT);
                }
                user.watchlist.push(auctionQuery);
                const isSucc = await AuctionsHelper.updateItem({userId: msg.senderId}, {
                    $set: {
                        watchlist: user.watchlist,
                        cacheDate: Date.now()
                    }
                });
                if (isSucc) {
                    return msg.send(`${AUCTIONS.QUERY} "${auctionQuery}" ${AUCTIONS.TRACKED}`);
                } else {
                    return this.processError(msg);
                }
            } else {
                const auctionsSearchArray = [auctionQuery];
                await AuctionsHelper.createItem({userId: msg.senderId, watchlist: auctionsSearchArray});
                return msg.send(`${AUCTIONS.QUERY} "${auctionQuery}" ${AUCTIONS.TRACKED}`);
            }
        } catch (e) {
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND);
            }
            console.log(e);
            return this.processError(msg);
        }
    }
}
