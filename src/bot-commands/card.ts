import VK, { Keyboard, MessageContext } from 'vk-io';

import { REGEX_CONSTANTS } from '../utils/constants';
import { ERRORS } from '../utils/strings';
import { CommandInterface } from '../types/command';
import { getCardByName } from "../utils/scryfall-utils";


export default class CardCommand implements CommandInterface {
    fullName: string; // 'card';
    shortName: string; // 'c';
    public vkBotApi: VK;
    public regex: RegExp;
    public regexGroup: RegExp;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        this.vkBotApi = vkApi;
        this.fullName = 'card';
        this.shortName = 'c';
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = /start/i;
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})(${this.shortName}|${this.fullName}) (.*)`, REGEX_CONSTANTS.REGEX_FLAGS);
            console.log(this.regexGroup);
        }
    }

    public checkRegex(stringToCheck: string, isGroup = false): boolean {
        return isGroup ? this.regexGroup.test(stringToCheck) : this.regex.test(stringToCheck);
    }

    public async processCommand(msg: MessageContext): Promise<any> {

        /**
         *
         * Administration managing should be here
         *
         */


        const cardNames = msg.text.match(this.regexGroup)[3];
        console.log(msg.text.match(this.regexGroup));
        if (cardNames.trim().length === 0) {
            return this.processError(ERRORS.CARD_NO_CARD, msg);
        }
        const splittedCardNames = cardNames.split(';');

        if (cardNames.length > 0) {
            try {
                const foundCard = await getCardByName(cardNames);
                console.log(msg);
                await msg.sendPhoto(foundCard.image_uris.normal);
                // msg.send({
                //     keyboard: Keyboard.keyboard([Keyboard.textButton({
                //         label: 'Узнать цену',
                //         payload: {command: 'test1'}
                //     }), Keyboard.textButton({
                //         label: 'Посмотреть все издания',
                //     })], {oneTime: true}),
                //     peer_id: msg.peerId,
                // });
            } catch (e) {
                console.log(e);
                //nothing
            }
        }

    }


    public processError(errorMsg: string, msg: MessageContext): void {
    }

    isCommandAvailable(msg: MessageContext): boolean {
        return false;
    }
}
