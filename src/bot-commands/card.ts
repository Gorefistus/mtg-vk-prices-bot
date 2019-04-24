import VK, { MessageContext } from 'vk-io';
import { Card } from 'scryfall-sdk';

import {PEER_TYPES, REGEX_CONSTANTS} from '../utils/constants';
import { ERRORS } from '../utils/strings';
import { getCardByName } from "../utils/scryfall-utils";
import ImageHelper from "../utils/database/image-helper";
import { ImageCache } from "image-cache";
import BasicCommand from './basic-command';


export default class CardCommand extends BasicCommand {
    fullName: string; // 'card';
    shortName: string; // 'c';
    public vkBotApi: VK;
    public regex: RegExp;
    public regexGroup: RegExp;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
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
        }
    }

    public async processCommand(msg: MessageContext): Promise<any> {

        /**
         *
         * Administration managing should be here
         *
         */


        const cardNames = msg.text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        if (cardNames.trim().length === 0) {
            return this.processError(msg, ERRORS.CARD_NO_CARD);
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


                const cardImageObjects: Array<ImageCache> = [];
                for (const card of foundCardArray) {
                    if (card.card_faces) {
                        for (const cardFace of card.card_faces) {
                            const cardPhotoObjectFromCache = await ImageHelper.getItem({cardId: cardFace.illustration_id});
                            if (cardPhotoObjectFromCache) {
                                cardImageObjects.push(cardPhotoObjectFromCache);
                            } else {
                                const cardPhotoObject = await this.vkBotApi.upload.messagePhoto({source: {value: cardFace.image_uris.normal}});
                                if (cardPhotoObject) {
                                    const photoObjectToCache: ImageCache = {
                                        cardId: cardFace.illustration_id,
                                        cardObject: card,
                                        photoObject: cardPhotoObject
                                    };
                                    cardImageObjects.push(photoObjectToCache);
                                    ImageHelper.createItem(photoObjectToCache);
                                }
                            }
                        }
                    } else {
                        const cardPhotoObjectFromCache = await ImageHelper.getItem({cardId: card.illustration_id});
                        if (cardPhotoObjectFromCache) {
                            cardImageObjects.push(cardPhotoObjectFromCache);
                        } else {
                            const cardPhotoObject = await this.vkBotApi.upload.messagePhoto({source: {value: card.image_uris.normal}});
                            if (cardPhotoObject) {
                                const photoObjectToCache: ImageCache = {
                                    cardId: card.illustration_id,
                                    cardObject: card,
                                    photoObject: cardPhotoObject
                                };
                                cardImageObjects.push(photoObjectToCache);
                                ImageHelper.createItem(photoObjectToCache);
                            }
                        }
                    }

                }
                let attachment = '';
                cardImageObjects.forEach(cardImage => {
                    attachment = `${attachment}photo${cardImage.photoObject.ownerId}_${cardImage.photoObject.id},`;
                });

                msg.send('', {attachment});
            } catch (e) {
                if (!e) {
                    return this.processError(msg, ERRORS.CARD_NOT_FOUND)
                }
                return this.processError(msg);
            }
        }

    }

}
