import VK, { MessageContext } from 'vk-io';
import { Card } from 'scryfall-sdk';
import axios from 'axios';
import fs from 'fs';
import * as path from 'path';


import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { ERRORS, ERRORS_EN, GENERAL_EN } from '../utils/strings';
import { getCardByName } from '../utils/scryfall-utils';
import ImageHelper from '../utils/database/image-helper';
import { ImageCache } from 'image-cache';
import BasicCommand from './basic-command';
import { getRecommendation } from '../utils/recommendation';
import BootBot, { FBMessagePayload } from 'bootbot';


export default class CardCommand extends BasicCommand {
    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'card';
        this.shortName = 'c';
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


    public async processCommand(msg: MessageContext): Promise<any> {

        /**
         *
         * Administration managing should be here
         *
         */

        const downloadFunction = async function (sourceURl: string, fileName: string): Promise<any> {
            const image = await axios.get(sourceURl, {responseType: 'stream'});
            return new Promise<any>(((resolve, reject) => {
                const ws = fs.createWriteStream(`${fileName}`);
                image.data.pipe(ws);
                ws.on('error', (err) => {
                    reject(err);
                }).on('finish', resolve);
            }));
        };

        const commandString = msg.messagePayload ? msg.messagePayload.command : msg.text;

        const cardNames = commandString.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        if (cardNames.trim().length === 0) {
            return this.processError(msg, ERRORS.CARD_NO_CARD);
        }
        const splittedCardNames = cardNames.split(';');

        if (splittedCardNames.length > 0) {
            const foundCardArray: Array<Card> = [];
            const notFoundCardArray: Array<string> = [];

            try {
                for (const cardName of splittedCardNames) {
                    if (cardName.trim().length > 0) {
                        const cardSetSplit = cardName.match(/(.*)\[(.{3,4})\]/i);
                        let foundCard: Card;
                        try {
                            if (cardSetSplit !== null) {
                                foundCard = await getCardByName(cardSetSplit[1], cardSetSplit[2]);
                            } else {
                                foundCard = await getCardByName(cardName);
                            }
                            foundCardArray.push(foundCard);
                        } catch (e) {
                            // TODO: could there be other errors like network one?
                            notFoundCardArray.push(cardSetSplit !== null ? `${cardSetSplit[1]}[${cardSetSplit[2]}]` : cardName);
                        }
                    }
                }
                const cardImageObjects: Array<ImageCache> = [];
                for (const card of foundCardArray) {
                    if (card.card_faces && !card.image_uris) {
                        for (const cardFace of card.card_faces) {
                            const cardPhotoObjectFromCache = await ImageHelper.getItem({
                                cardId: card.id + cardFace.illustration_id
                            });
                            if (cardPhotoObjectFromCache) {
                                cardImageObjects.push(cardPhotoObjectFromCache);
                            } else {
                                const sourceUrl = cardFace.image_uris.normal;
                                const imageName = `${cardFace.illustration_id}.jpg`;
                                await downloadFunction(sourceUrl, imageName);

                                const cardPhotoObject = await this.vkBotApi.upload.messagePhoto({source: {value: path.resolve(imageName)}});
                                fs.unlinkSync(imageName);

                                if (cardPhotoObject) {
                                    const photoObjectToCache: ImageCache = {
                                        cardId: card.id + cardFace.illustration_id,
                                        cardObject: card,
                                        photoObject: cardPhotoObject
                                    };
                                    cardImageObjects.push(photoObjectToCache);
                                    ImageHelper.createItem(photoObjectToCache);
                                }
                            }
                        }
                    } else {
                        const cardPhotoObjectFromCache = await ImageHelper.getItem({cardId: card.id + card.illustration_id});
                        if (cardPhotoObjectFromCache) {
                            cardImageObjects.push(cardPhotoObjectFromCache);
                        } else {
                            const sourceUrl = card.image_uris.normal;
                            const imageName = `${card.illustration_id}.jpg`;
                            await downloadFunction(sourceUrl, imageName);

                            const cardPhotoObject = await this.vkBotApi.upload.messagePhoto({source: {value: path.resolve(imageName)}});
                            fs.unlinkSync(imageName);

                            if (cardPhotoObject) {
                                const photoObjectToCache: ImageCache = {
                                    cardId: card.id + card.illustration_id,
                                    cardObject: card,
                                    photoObject: cardPhotoObject,
                                    art: false,
                                    trade: false,
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

                const keyboard = splittedCardNames.length === 1 ? getRecommendation(splittedCardNames[0], this.shortName, msg.hasMessagePayload) : undefined;
                if (keyboard) {
                    msg.send('', {attachment, keyboard: keyboard});
                } else {
                    msg.send('', {attachment});
                }
            } catch (e) {
                console.log(e);
                return this.processError(msg);
            } finally {
                if (notFoundCardArray.length > 0) {
                    msg.send(`${ERRORS.CARDS_NOT_FOUND} ${notFoundCardArray.join(', ')} `);
                }
            }
        }

    }


    async processCommandFacebook(payload: FBMessagePayload): Promise<any> {

        const commandString = payload?.message?.text || payload?.postback?.payload;

        const cardNames = commandString.match(this.regex)[3];
        if (cardNames.trim().length === 0) {
            return this.processErrorFacebook(payload, ERRORS_EN.CARD_NO_CARD);
        }
        const splittedCardNames = cardNames.split(';');

        if (splittedCardNames.length > 0) {
            const foundCardArray: Array<Card> = [];
            const notFoundCardArray: Array<string> = [];

            try {
                for (const cardName of splittedCardNames) {
                    if (cardName.trim().length > 0) {
                        const cardSetSplit = cardName.match(/(.*)\[(.{3,4})\]/i);
                        let foundCard: Card;
                        try {
                            if (cardSetSplit !== null) {
                                foundCard = await getCardByName(cardSetSplit[1], cardSetSplit[2]);
                            } else {
                                foundCard = await getCardByName(cardName);
                            }
                            foundCardArray.push(foundCard);
                        } catch (e) {
                            // TODO: could there be other errors like network one?
                            notFoundCardArray.push(cardSetSplit !== null ? `${cardSetSplit[1]}[${cardSetSplit[2]}]` : cardName);
                        }
                    }
                }
                const cardImageObjects: Array<{ title: string, subtitle?: string, image_url: string, default_action: any, buttons?: Array<any> }> = [];
                for (const card of foundCardArray) {
                    if (card.card_faces && !card.image_uris) {
                        for (const cardFace of card.card_faces) {
                            cardImageObjects.push({
                                title: cardFace.name,
                                subtitle: cardFace.artist,
                                image_url: cardFace.image_uris.normal,
                                default_action: {
                                    type: 'web_url',
                                    'url': cardFace.image_uris.normal,
                                    'webview_height_ratio': 'tall'
                                },
                                buttons: [{
                                    type: 'web_url',
                                    url: card.purchase_uris.tcgplayer,
                                    title: 'Buy on TCG'
                                }, {
                                    type: 'web_url',
                                    url: card.purchase_uris.cardhoarder,
                                    title: 'Buy on CardHoarder'
                                }],
                            });
                        }
                    } else {
                        cardImageObjects.push({
                            title: card.name,
                            subtitle: card.artist,
                            image_url: card.image_uris.normal,
                            default_action: {
                                type: 'web_url',
                                'url': card.image_uris.normal,
                                'webview_height_ratio': 'tall'
                            },
                            buttons: [{
                                type: 'web_url',
                                url: card.purchase_uris.tcgplayer,
                                title: GENERAL_EN.BUY_TCG
                            }, {
                                type: 'web_url',
                                url: card.purchase_uris.cardhoarder,
                                title: GENERAL_EN.BUY_CARDHOARDER
                            }],
                        });
                    }

                }
                // @ts-ignore
                this.fbApi.sendGenericTemplate(payload.sender.id, cardImageObjects, {imageAspectRatio: 'square'});
            } catch (e) {
                console.log(e);
                return this.processErrorFacebook(payload);
            } finally {
                if (notFoundCardArray.length > 0) {
                    this.fbApi.say(payload.sender.id, `${ERRORS.CARDS_NOT_FOUND} ${notFoundCardArray.join(', ')} `);
                }
            }
        }


        return super.processCommandFacebook(payload);
    }
}
