import axios from 'axios';
import VK, { MessageContext } from 'vk-io';

import BasicCommand from './basic-command';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { ERRORS, GENERAL } from '../utils/strings';
import { getCardByName } from '../utils/scryfall-utils';
import { Card } from 'scryfall-sdk';


export default class PrintingsCommand extends BasicCommand {

    fullName: string; // printings
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string;  // pr
    vkBotApi: VK;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.fullName = 'printings';
        this.shortName = 'pr';
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
        /**
         *
         * Administration managing should be here
         *
         */

        const commandString = msg.messagePayload ? msg.messagePayload.command : msg.text;


        let cardName = commandString.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        const splittedString = cardName.split('|');
        let page = 0;
        if (splittedString.length > 1) {
            cardName = splittedString[0];
            page = parseInt(splittedString[1], 10);
        }
        try {
            const foundCard = await getCardByName(cardName);
            const response = await axios.get(foundCard.prints_search_uri, {data: 'json'});
            if (response.status < 200 && response.status > 300) {
                return this.processError(msg, ERRORS.SCRYFALL_REQUEST_TIMEOUT);
            }
            const printings = <Array<Card>>response.data.data;
            const originalLength = printings.length;
            const pages = Math.ceil(printings.length / 10);

            const filteredPrintings = printings.splice(page > 0 && page <= pages ? ((page - 1) * 15) : 0, 15);

            const resultString = this.prepareResultsString(filteredPrintings, originalLength, pages, page);
            msg.send(resultString);
        } catch (e) {
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND);
            }
            console.log(e);
            return this.processError(msg);
        }
    }

    prepareResultsString(cards: Array<Card>, length: number, pages: number, page?: number): string {
        let resultString = `${cards.length} ${GENERAL.PRINTINGS} ${cards[0].name} (${GENERAL.TOTAL}: ${length}) (${GENERAL.PAGE} ${page && page > 0 && page <= pages ? page : '1'}/${pages}):\n`;
        cards.forEach(card => {
            resultString = `${resultString} ${card.set_name} [${card.set.toUpperCase()}] \n`;
        });
        return resultString;
    }
}
