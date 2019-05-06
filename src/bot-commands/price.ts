import VK, {MessageContext} from 'vk-io';
import {Card} from "scryfall-sdk";
import axios from 'axios';



import BasicCommand from './basic-command';
import {PEER_TYPES, REGEX_CONSTANTS, API_LINKS} from '../utils/constants';
import {getCardByName} from "../utils/scryfall-utils";
import {getGoldfishPriceGraph} from '../utils/goldfish-utils';
import {ERRORS, LOGS} from "../utils/strings";
import PriceHelper from '../utils/database/price-helper';
import ImageHelper from '../utils/database/image-helper';
import {getStartCityPrices} from "../utils/scg-utils";


export default class PriceCommand extends BasicCommand {
    fullName: string; // price
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string;  // p
    vkBotApi: VK;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.fullName = 'price';
        this.shortName = 'p';
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


    async processCommand(msg: MessageContext) {
        const cardName = msg.text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        const cardSetSplit = cardName.match(/(.*)\[(.{3,4})\]/i);
        let foundCard: Card = undefined;
        try {
            if (cardSetSplit !== null) {
                foundCard = await getCardByName(cardSetSplit[1], cardSetSplit[2])
            } else {
                foundCard = await getCardByName(cardName);
            }
            let foundCardName = foundCard.name;
            if (foundCard.card_faces) {
                // we only need first half of the name if card is a split card, so we split
                foundCardName = foundCard.name.split('//')[0].trim();
            }
            const priceFromCache = await PriceHelper.getItem({cardId:foundCard.id});
            if(priceFromCache){
                const priceImageFromCache = await ImageHelper.getItem({cardId: foundCard.id, trade: true});
                // TODO MAKE BOT POST A PRICE
            } else {
                const image = await getGoldfishPriceGraph(foundCardName, foundCard);

                //// SCG PRICES SCRAPING START
                try {
                    const starCityPage = <string>(await axios.get(`${API_LINKS.STAR_CITY_PRICE}${encodeURIComponent(cardName)}&auto=Y`)).data;
                    const scgPrice = getStartCityPrices(starCityPage, foundCard);
                    console.log(scgPrice);

                }catch (e) {
                    console.error(LOGS.STARCITY_PRICE_REQUEST_ERROR, e);
                }

            }
        } catch (e) {
            console.log(e);
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND)
            }
            return this.processError(msg);
        }
    }

}
