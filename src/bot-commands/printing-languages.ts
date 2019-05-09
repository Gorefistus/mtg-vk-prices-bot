import VK, { MessageContext } from 'vk-io';
import { Card } from 'scryfall-sdk';
import axios from 'axios';

import BasicCommand from './basic-command';
import { API_LINKS, PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { getCardByName } from '../utils/scryfall-utils';
import { ERRORS, GENERAL } from '../utils/strings';
import { getLanguageByLangCode } from '../utils/utils';

export default class PrintingLanguagesCommand extends BasicCommand {

    fullName: string; // printingLanguages
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string;  // pl
    vkBotApi: VK;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.fullName = 'printing:anguages';
        this.shortName = 'pl';
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
        const cardName = msg.text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        const cardSetSplit = cardName.match(/(.*)\[(.{3,4})\]/i);
        let foundCard: Card = undefined;
        try {
            if (cardSetSplit !== null) {
                foundCard = await getCardByName(cardSetSplit[1], cardSetSplit[2]);
            } else {
                foundCard = await getCardByName(cardName);
            }
            const response = await axios.get(`${API_LINKS.SCRY_API}!"${foundCard.name}"s:${foundCard.set}&include_multilingual=true&unique=prints`, {data: 'json'});
            if (response.status < 200 && response.status > 300) {
                return this.processError(msg, ERRORS.SCRYFALL_REQUEST_TIMEOUT);
            }
            const printings = <Array<Card>>response.data.data;
            if (!printings && printings.length === 0) {
                return this.processError(msg, ERRORS.NO_PRINTINGS);
            }

            const alreadyShownLanguages: Array<string> = [];
            let printingsLanguagesString = `${GENERAL.PRINTED_LANGUAGES} ${foundCard.printed_name ? foundCard.printed_name : foundCard.name} [${foundCard.set_name}]:\n`;
            printings.forEach(printing => {
                // @ts-ignore
                if (!alreadyShownLanguages.includes(printing.lang)) {
                    alreadyShownLanguages.push(printing.lang);
                    printingsLanguagesString += `${GENERAL.LANGUAGE}: ${getLanguageByLangCode(printing.lang)}. ${GENERAL.CARD_NAME}: ${printing.printed_name ? printing.printed_name : printing.name}\n`;
                }
            });

            msg.send(printingsLanguagesString);
        } catch (e) {
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND);
            }
            console.log(e);
            return this.processError(msg);
        }
    }
}
