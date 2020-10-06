import BasicCommand from './basic-command';
import VK, { MessageContext } from 'vk-io';
import { LEGALITY, PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import * as STRINGS from '../utils/strings';
import { ERRORS, ERRORS_EN } from '../utils/strings';
import { getCardByName } from '../utils/scryfall-utils';
import BootBot, { FBMessagePayload } from 'bootbot';


export default class LegalityCommand extends BasicCommand {
    fullName: string; // 'legality';
    shortName: string; // 'l';
    regex: RegExp;
    regexGroup: RegExp;
    vkBotApi: VK;


    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'legality';
        this.shortName = 'l';
        this.fbApi = fbApi;
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
        /**
         *
         * Administration managing should be here
         *
         */

        const commandString = msg.messagePayload ? msg.messagePayload.command : msg.text;


        const cardName = commandString.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        try {
            const foundCard = await getCardByName(cardName);
            let legalityString = `Легальность карты ${foundCard.printed_name ? foundCard.printed_name : foundCard.name} в форматах:\n`;

            legalityString = `${legalityString}
${STRINGS.FORMATS.STANDARD}: ${this.getLegality(foundCard.legalities.standard)}
${STRINGS.FORMATS.MODERN}: ${this.getLegality(foundCard.legalities.modern)}
${STRINGS.FORMATS.LEGACY}: ${this.getLegality(foundCard.legalities.legacy)}
${STRINGS.FORMATS.PIONEER}: ${this.getLegality(foundCard.legalities.pioneer)}
${STRINGS.FORMATS.HISTORIC}: ${this.getLegality(foundCard.legalities.historic)}
${STRINGS.FORMATS.PAUPER}: ${this.getLegality(foundCard.legalities.pauper)}
${STRINGS.FORMATS.PENNY}: ${this.getLegality(foundCard.legalities.penny)}
${STRINGS.FORMATS.COMMANDER}: ${this.getLegality(foundCard.legalities.commander)}
${STRINGS.FORMATS.VINTAGE}: ${this.getLegality(foundCard.legalities.vintage)}
            `;

            msg.send(legalityString);
        } catch (e) {
            console.log(e);
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND);
            }
            return this.processError(msg);
        }
    }


    async processCommandFacebook(payload: FBMessagePayload): Promise<any> {
        const commandString = payload?.message?.text || payload?.postback?.payload;
        const cardName = commandString.match(this.regex)[3];
        try {
            const foundCard = await getCardByName(cardName);
            let legalityString = `Legality of ${foundCard.printed_name ? foundCard.printed_name : foundCard.name} in formats:\n`;

            legalityString = `${legalityString}
${STRINGS.FORMATS.STANDARD}: ${this.getLegality(foundCard.legalities.standard, true)}
${STRINGS.FORMATS.MODERN}: ${this.getLegality(foundCard.legalities.modern, true)}
${STRINGS.FORMATS.LEGACY}: ${this.getLegality(foundCard.legalities.legacy, true)}
${STRINGS.FORMATS.PIONEER}: ${this.getLegality(foundCard.legalities.pioneer, true)}
${STRINGS.FORMATS.HISTORIC}: ${this.getLegality(foundCard.legalities.historic, true)}
${STRINGS.FORMATS.PAUPER}: ${this.getLegality(foundCard.legalities.pauper, true)}
${STRINGS.FORMATS.PENNY}: ${this.getLegality(foundCard.legalities.penny, true)}
${STRINGS.FORMATS.COMMANDER}: ${this.getLegality(foundCard.legalities.commander, true)}
${STRINGS.FORMATS.VINTAGE}: ${this.getLegality(foundCard.legalities.vintage, true)}
            `;

            this.fbApi.say(payload.sender.id, legalityString);
        } catch (e) {
            console.log(e);
            if (!e) {
                return this.processErrorFacebook(payload, ERRORS_EN.CARD_NOT_FOUND);
            }
            return this.processErrorFacebook(payload);
        }


    }

    getLegality(legality: string, isEn = false): string {
        const legalityDictionary = isEn ? STRINGS.LEGALITY_EN : STRINGS.LEGALITY;
        switch (legality) {
            case LEGALITY.LEGAL:
                return legalityDictionary.LEGAL;
            case LEGALITY.BANNED:
                return legalityDictionary.BANNED;
            case LEGALITY.NOT_LEGAL:
                return legalityDictionary.NOT_LEGAL;
            case LEGALITY.RESTRICTED:
                return legalityDictionary.RESTRICTED;
            default:
                return legalityDictionary.NOT_LEGAL;
        }
    }
}
