import VK, {MessageContext} from 'vk-io';
import {Card} from 'scryfall-sdk';

import {REGEX_CONSTANTS} from '../utils/constants';
import {ERRORS} from '../utils/strings';
import {CommandInterface} from 'command.d.ts';
import {getCardByName} from "../utils/scryfall-utils";
import ImageHelper from "../utils/database/image-helper";


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
        if (cardNames.trim().length === 0) {
            return this.processError(ERRORS.CARD_NO_CARD, msg);
        }
        const splittedCardNames = cardNames.split(';');
        if (splittedCardNames.length > 0) {
            // console.log(splittedCardNames[0]);
        }

        if (splittedCardNames.length > 0) {
            try {
                const foundCardArray: Array<Card> = [];
                for (const cardName of splittedCardNames) {
                    if (cardName.trim().length > 0) {
                        const cardSetSplit = cardName.match(/(.*)\[(.{3,4})\]/i);
                        let foundCard: Card;
                        if (cardSetSplit !== null) {
                            foundCard = await getCardByName(cardSetSplit[1], cardSetSplit[2]);
                        } else {
                            foundCard = await getCardByName(cardName);
                        }
                        foundCardArray.push(foundCard);
                    }
                }

                const test1 = await ImageHelper.getItem({cardId: foundCardArray[0].id});
                console.log(test1.photoObject);

                // const uploadRequestArray: Array<Promise<any>> = [];
                // console.log(foundCardArray);
                // foundCardArray.forEach((card, index) => {
                //     if (card.card_faces) {
                //         card.card_faces.forEach(cardFace => {
                //             uploadRequestArray.push(this.vkBotApi.upload.messagePhoto({
                //                 source: {
                //                     value: cardFace.image_uris.normal,
                //                     timeout: (index + 1) * 1000
                //                 }
                //             }))
                //         })
                //     } else {
                //         uploadRequestArray.push(this.vkBotApi.upload.messagePhoto({
                //             source: {
                //                 value: card.image_uris.normal,
                //                 timeout: (index + 1) * 1000
                //             }
                //         }));
                //     }
                // });
                // const test2 = await Promise.all(uploadRequestArray);
                // console.log(test2);
                // const test1 = await this.vkBotApi.upload.messagePhoto({source: {values: [foundCardArray[0].image_uris.normal, foundCardArray[1].image_uris.normal]}});
                // console.log(test1);
                // const foundCard = await getCardByName(splittedCardNames[0]);
                // // console.log(foundCard);
                // const id =  await msg.sendPhoto(foundCard.image_uris.normal);
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
