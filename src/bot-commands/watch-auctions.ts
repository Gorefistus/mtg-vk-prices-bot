import BasicCommand from "./basic-command";
import VK, { MessageContext } from "vk-io";
import { PEER_TYPES, REGEX_CONSTANTS } from "../utils/constants";
import { ERRORS } from "../utils/strings";
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
            this.regex = /start/i;
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})(${this.shortName}|${this.fullName})( .*)?`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    async processCommand(msg: MessageContext): Promise<any> {
        // TODO I'm TESTING THIS IN REVERSE ORDER, GROUPS SHOULD BE BANNED
        if (PEER_TYPES.GROUP !== msg.peerType) {
            return this.processError(msg, ERRORS.AUCTIONS_WATCH_GROUP);
        }

        const auctionQuery = msg.text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3].trim();


        try {
            let user = await AuctionsHelper.getItem({userId: msg.senderId});
            if (user) {
                if (user.watchlist.length > 4) {
                    return this.processError(msg, 'НЕЛЬЗЯ СЛЕДИТЬ БОЛЬШЕ ЧЕМ ЗА 5 АУКЦИОНАМИ');
                }
                user.watchlist.push(auctionQuery);
                const isSucc = await AuctionsHelper.updateItem({userId: msg.senderId}, {
                    $set: {
                        watchlist: user.watchlist,
                        cacheDate: Date.now()
                    }
                });
            } else {
                const auctionsSearchArray = [auctionQuery];
                user = await AuctionsHelper.createItem({userId: msg.senderId, watchlist: auctionsSearchArray});
            }
            console.log(user);
        } catch (e) {
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND);
            }
            console.log(e);
            return this.processError(msg);
        }
        console.log(auctionQuery);

    }
}
