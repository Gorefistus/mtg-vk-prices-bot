import * as Scry from 'scryfall-sdk';
import { Card } from 'scryfall-sdk';
import VK, { MessageContext } from 'vk-io';


import BasicCommand from './basic-command';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { ERRORS, GENERAL } from '../utils/strings';


export default class AdvancedSearchCommand extends BasicCommand {
    fullName: string; // advancedSearch
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string;  // as
    vkBotApi: VK;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.fullName = 'advancedsearch';
        this.shortName = 'as';
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
        let searchQuery = msg.text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3].replace(new RegExp('&quot;', 'g'), '"')
            .replace(new RegExp('&gt;', 'g'), '>')
            .replace(new RegExp('&lt;', 'g'), '<');
        let page = 0;
        const splittedString = searchQuery.split('|');
        if (splittedString.length > 1) {
            searchQuery = splittedString[0];
            page = parseInt(splittedString[1], 10);
        }
        try {
            const foundCards = await Scry.Cards.search(searchQuery, {page: 1}).waitForAll();
            const pages = Math.ceil(foundCards.length / 15);
            if (!foundCards || foundCards.length === 0) {
                return this.processError(msg, ERRORS.CARDS_SEARCH_NOT_FOUND);
            }

            const filteredCards = foundCards.splice(page > 0 && page <= pages ? ((page - 1) * 15) : 0, 15);
            const resultString = this.prepareResultsString(filteredCards, pages, page);
            return msg.send(resultString);
        } catch (e) {
            console.log(e);
            this.processError(msg);
        }
    }

    prepareResultsString(cards: Array<Card>, pages: number, page?: number): string {
        let resultString = `${GENERAL.CARDS_SEARCH_MATCH_CRITERIA}  (${GENERAL.PAGE}: ${page && page > 0 && page <= pages ? page : '1'}/${pages}):\n`;
        cards.forEach(card => {
            resultString = `${resultString} ${card.name} \n`;
        });
        return resultString;
    }
}
