import VK, { MessageContext } from "vk-io";
import axios from 'axios';

import {API_LINKS, PEER_TYPES, REGEX_CONSTANTS, TIME_CONSTANTS} from "../utils/constants";
import { AUCTIONS, ERRORS } from "../utils/strings";
import { TopdeckAuction, TopdeckEndedAuction } from "topdeck-auction";
import * as moment from "moment";
import BasicCommand from './basic-command';


export default class AuctionsCommand extends BasicCommand {
    fullName: string; //auctions
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string; //ac
    vkBotApi: VK;


    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'auctions';
        this.shortName = 'ac';

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

        try {
            const auctionsSearchQuery = msg.text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
            if (auctionsSearchQuery && auctionsSearchQuery.trim().length < 3) {
                return this.processError(msg, ERRORS.REQUEST_TOO_SHORT);
            }


            // TOPDECK CURRENT AUCTIONS SEARCH START----------------------------

            const topdeckCurrentAuctionsPricesResponse = await axios.get(API_LINKS.TOPDECK_AUCTIONS, {responseType: 'json'});
            if (topdeckCurrentAuctionsPricesResponse.status < 200 && topdeckCurrentAuctionsPricesResponse.status > 300) {
                return this.processError(msg, ERRORS.TOPDECK_REQUEST_TIMEOUT);
            }
            // we need to reverse array with prices because response in reverse order
            const topdeckCurrentAuctionsPrices: Array<TopdeckAuction> = topdeckCurrentAuctionsPricesResponse.data.reverse();
            const filteredResults: Array<TopdeckAuction> = [];
            if (auctionsSearchQuery) {
                for (const auctionEntry of topdeckCurrentAuctionsPrices) {
                    if (auctionEntry.lot.toLowerCase().includes(auctionsSearchQuery.trim())) {
                        filteredResults.push(auctionEntry);
                    }
                    if (filteredResults.length > 4) {
                        break;
                    }
                }
            } else {
                // @ts-ignore
                filteredResults.push(topdeckCurrentAuctionsPrices.slice(0, 5));
            }
            const currentAuctionsResult = filteredResults.map(auction => {
                return ` \n ${AUCTIONS.LOT} ${auction.lot} | ${AUCTIONS.CURRENT_BID} ${auction.current_bid} | ${AUCTIONS.DATE_ESTIMATED} ${moment.unix(Number.parseInt(auction.date_estimated, 10)).format(TIME_CONSTANTS.AUCTIONS)}`;
            });


            // TOPDECK ENDED AUCTIONS SEARCH START----------------------------

            // It's unnecessary to search recently ended auctions without params
            if (auctionsSearchQuery) {
                const topdeckEndedAuctionsPricesResponse = await axios.get(`${API_LINKS.TOPDECK_AUCTIONS_FINISHED_SEARCH}${encodeURIComponent(auctionsSearchQuery.trim())}`,
                    {responseType: 'json'});
                if (topdeckEndedAuctionsPricesResponse.status < 200 && topdeckEndedAuctionsPricesResponse.status > 300) {
                    return this.processError(msg, ERRORS.TOPDECK_REQUEST_TIMEOUT);
                }
                // ended auctions already sorted for us, so we don't need to sort them again
                const topdeckEndedAuctionsPrices: Array<TopdeckEndedAuction> = topdeckEndedAuctionsPricesResponse.data.auctions;
                const endedAuctionsResult = [];
                let i = 0;
                for (const endedAuction of topdeckEndedAuctionsPrices) {
                    i++;
                    endedAuctionsResult.push(`\n ${AUCTIONS.LOT} ${endedAuction.lot} |  ${AUCTIONS.WINNING_BID} ${endedAuction.winning_bid} | ${AUCTIONS.DATE_ESTIMATED} ${moment.unix(Number.parseInt(endedAuction.date_ended, 10)).format(TIME_CONSTANTS.AUCTIONS)} `);
                    if (i > 4)
                        break;
                }
                if (currentAuctionsResult.length === 0 && endedAuctionsResult.length === 0) {
                    return msg.send(ERRORS.AUCTIONS_NOT_FOUND);
                }
                msg.send(`\n\n${AUCTIONS.CURRENT_MATCH_CRITERIA}${currentAuctionsResult.join()}\n\n${AUCTIONS.ENDED_MATCH_CRITERIA}${endedAuctionsResult.join()}`);
            }

        } catch (e) {
            console.log(e, `\n${this.fullName}`);
            this.processError(msg);

        }

        return undefined;
    }

}
