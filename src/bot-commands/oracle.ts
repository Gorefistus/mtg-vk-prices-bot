import BasicCommand from './basic-command';
import VK, { MessageContext } from 'vk-io';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { getCardByName } from '../utils/scryfall-utils';
import { ERRORS, ERRORS_EN, GENERAL_EN } from '../utils/strings';
import { getRecommendation } from '../utils/recommendation';
import BootBot, { FBMessagePayload } from 'bootbot';
import { Card } from 'scryfall-sdk';


export default class OracleCommand extends BasicCommand {
    fullName: string; // 'oracle';
    shortName: string; // 'o';
    public vkBotApi: VK;
    public regex: RegExp;
    public regexGroup: RegExp;

    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi,  regex, regexGroup);
        this.fullName = 'oracle';
        this.shortName = 'o';
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

            const oracleText = this.getOracleString(foundCard);
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


    async processCommandFacebook(payload: FBMessagePayload): Promise<any> {
        const commandString = payload?.message?.text || payload?.postback?.payload;

        const cardName = commandString.match(this.regex)[3];
        try {
            const foundCard = await getCardByName(cardName);
            const oracleText = this.getOracleString(foundCard);
            return this.fbApi.say(payload.sender.id, {
                text: oracleText, buttons: [{
                    type: 'postback',
                    title: GENERAL_EN.VIEW_IMAGE,
                    payload: `!c ${foundCard.name}[${foundCard.set}]`,
                }]
            });
        } catch (e) {
            if (!e) {
                return this.processErrorFacebook(payload, ERRORS_EN.CARD_NOT_FOUND);
            }
            console.log(e);
            return this.processErrorFacebook(payload);
        }

    }

    getOracleString(card: Card): string {
        let oracleText = '';
        if (card.card_faces && card.card_faces.length > 0) {
            card.card_faces.forEach(card_face => {
                oracleText = `${oracleText}
${card_face.name} oracle text:\n
Mana cost: ${card_face.mana_cost.length > 0 ? card_face.mana_cost : `None`} (CMC = ${card.cmc})
${card_face.type_line}\n
${card_face.oracle_text}
${card_face.loyalty ? `Starting loyalty: ${card_face.loyalty}` : ''}\n
${card_face.power ? `🗡: ${card_face.power}` : ''} ${card_face.toughness ? `🛡: ${card_face.toughness}` : ''}
                    `;
            });
        } else {
            oracleText = `${oracleText}
${card.name} oracle text:\n
Mana cost: ${card.mana_cost.length > 0 ? card.mana_cost : `None`} (CMC = ${card.cmc})
${card.type_line}\n
${card.oracle_text}
${card.loyalty ? `Starting loyalty: ${card.loyalty}` : ''}\n
${card.power ? `🗡: ${card.power}` : ''} ${card.toughness ? `🛡: ${card.toughness}` : ''}
                    `;
        }
        return oracleText;
    }
}

