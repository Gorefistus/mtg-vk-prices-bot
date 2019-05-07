import BasicCommand from "./basic-command";
import VK, {MessageContext} from "vk-io";
import {LEGALITY, PEER_TYPES, REGEX_CONSTANTS} from "../utils/constants";
import * as STRINGS from '../utils/strings';
import {ERRORS} from "../utils/strings";
import {getCardByName} from "../utils/scryfall-utils";


export default class LegalityCommand extends BasicCommand {
    fullName: string; // 'legality';
    shortName: string; // 'l';
    regex: RegExp;
    regexGroup: RegExp;
    vkBotApi: VK;


    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'legality';
        this.shortName = 'l';
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = /start/i;
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})(${this.shortName}|${this.fullName}) (.*)`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    async processCommand(msg: MessageContext): Promise<any> {
        const cardName = msg.text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        try {
            const foundCard = await getCardByName(cardName);
            let legalityString = `Легальность карты ${foundCard.printed_name ? foundCard.printed_name : foundCard.name} в форматах:\n`;

            legalityString = `${legalityString} 
             ${STRINGS.FORMATS.STANDARD}: ${this.getLegality(foundCard.legalities.standard)}
             ${STRINGS.FORMATS.MODERN}: ${this.getLegality(foundCard.legalities.modern)}
             ${STRINGS.FORMATS.LEGACY}: ${this.getLegality(foundCard.legalities.legacy)}
             ${STRINGS.FORMATS.PAUPER}: ${this.getLegality(foundCard.legalities.pauper)}
             ${STRINGS.FORMATS.PENNY}: ${this.getLegality(foundCard.legalities.penny)}
             ${STRINGS.FORMATS.COMMANDER}: ${this.getLegality(foundCard.legalities.commander)}
             ${STRINGS.FORMATS.MTGO_COMMANDER}: ${this.getLegality(foundCard.legalities["1v1"])}
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


    getLegality(legality: string): string {
        switch (legality) {
            case LEGALITY.LEGAL:
                return STRINGS.LEGALITY.LEGAL;
            case LEGALITY.BANNED:
                return STRINGS.LEGALITY.BANNED;
            case LEGALITY.NOT_LEGAL:
                return STRINGS.LEGALITY.NOT_LEGAL;
            case LEGALITY.RESTRICTED:
                return STRINGS.LEGALITY.RESTRICTED;
            default:
                return STRINGS.LEGALITY.NOT_LEGAL;
        }
    }
}
