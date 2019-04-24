import VK, {MessageContext} from 'vk-io';
import BasicCommand from './basic-command';
import {PEER_TYPES, REGEX_CONSTANTS} from '../utils/constants';
import {Card} from "scryfall-sdk";
import {getCardByName} from "../utils/scryfall-utils";
import {ERRORS} from "../utils/strings";


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
        } catch (e) {
            console.log(e);
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND)
            }
            return this.processError(msg);
        }

        console.log(foundCard);
    }

}
