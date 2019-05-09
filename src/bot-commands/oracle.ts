import BasicCommand from './basic-command';
import VK, { MessageContext } from 'vk-io';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { getCardByName } from '../utils/scryfall-utils';
import { ERRORS } from '../utils/strings';
import { getRecommendation } from '../utils/recommendation';


export default class OracleCommand extends BasicCommand {
    fullName: string; // 'oracle';
    shortName: string; // 'o';
    public vkBotApi: VK;
    public regex: RegExp;
    public regexGroup: RegExp;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.fullName = 'oracle';
        this.shortName = 'o';
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

        const cardName = commandString.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        try {
            const foundCard = await getCardByName(cardName);

            let oracleText = '';
            if (foundCard.card_faces && foundCard.card_faces.length > 0) {
                foundCard.card_faces.forEach(card_face => {
                    oracleText = `${oracleText}
                    ${card_face.name} oracle text:
                    Mana cost: ${card_face.mana_cost.length > 0 ? card_face.mana_cost : `None`} (CMC = ${foundCard.cmc})
                    ${card_face.type_line}\n
                    ${card_face.oracle_text}
                    ${card_face.loyalty ? `Starting loyalty: ${card_face.loyalty}` : ''}\n
                    ${card_face.power ? `🗡: ${card_face.power}` : ''} ${card_face.toughness ? `🛡: ${card_face.toughness}` : ''}
                    `;
                });
            } else {
                oracleText = `${oracleText}
                    ${foundCard.name} oracle text:
                    Mana cost: ${foundCard.mana_cost.length > 0 ? foundCard.mana_cost : `None`} (CMC = ${foundCard.cmc})
                    ${foundCard.type_line}\n
                    ${foundCard.oracle_text}
                    ${foundCard.loyalty ? `Starting loyalty: ${foundCard.loyalty}` : ''}\n
                    ${foundCard.power ? `🗡: ${foundCard.power}` : ''} ${foundCard.toughness ? `🛡: ${foundCard.toughness}` : ''}
                    `;
            }
            const keyboard = cardName ? getRecommendation(cardName, this.shortName, PEER_TYPES.GROUP !== msg.peerType) : undefined;

            if (keyboard) {
                msg.send(oracleText, {keyboard: keyboard});
            } else {
                msg.send(oracleText);

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
;
