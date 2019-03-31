import VK, {Keyboard, MessageContext} from 'vk-io';

import {CONSTANTS} from '../utils/constants';
import {CommandInterface} from '../types/command';
import {getCardByName} from "../utils/scryfall-utils";


export default class CardCommand implements CommandInterface {
    public vkBotApi: VK;
    public regex: RegExp;
    public regexGroup: RegExp;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        this.vkBotApi = vkApi;
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = /start/i;
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`${CONSTANTS.PREFIX} (asdasdasdasdas)`, CONSTANTS.REGEX_FLAGS)
        }
    }

    public checkRegex(stringToCheck: string, isGroup = false): boolean {
        return isGroup ? this.regexGroup.test(stringToCheck) : this.regex.test(stringToCheck);
    }

    public async processCommand(msg: MessageContext): Promise<any> {
        const cardName = msg.text.match(this.regexGroup)[1];
        if (cardName.length > 0) {
            try {
                const foundCard = await getCardByName(cardName);
                console.log(msg);
                await msg.sendPhoto(foundCard.image_uris.normal);
                msg.send({
                    keyboard: Keyboard.keyboard([Keyboard.textButton({
                        label: 'Узнать цену',
                        payload: {command: 'test1'}
                    }), Keyboard.textButton({
                        label: 'Посмотреть все издания',
                    })], {oneTime: true}),
                    peer_id: msg.peerId,
                });
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
