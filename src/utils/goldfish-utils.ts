import * as path from 'path';
import fs from 'fs';
import captureWebsite from 'capture-website';


import GoldfishDict from './goldfish-set-dictionary';
import * as Utils from './utils';
import { API_LINKS } from './constants';
import { LOGS } from './strings';
import ImageHelper from './database/image-helper';
import { Card } from 'scryfall-sdk';
import { ImageCache } from 'image-cache';
import VK, { PhotoAttachment } from 'vk-io';


export function checkAgainstGoldfishDict(setName: string, isFoil = false): string {
    let setNameToReturn = setName;
    GoldfishDict.forEach((goldFish) => {
        if ((isFoil ? setName.split('(Foil)')[0].trim()
            .toLowerCase() : setName.toLowerCase()) === goldFish.scry.toLowerCase()) {
            setNameToReturn = `${goldFish.goldfish}${isFoil ? ' (Foil)' : ''}`;
        }
    });
    return setNameToReturn;
}

/***
 * Gets and image of the graph price from MTGGOLDFISH site and uploads it to db
 * @param preparedCardName - we are doing preaparation(using only day side of two-faced cards) before passing it to gis method because we need it in the upper scope
 * @param cardObject
 */

export async function getGoldfishPriceGraph(vkApi: VK, preparedCardName: string, cardObject: Card): Promise<ImageCache> {
    const imageName = `${cardObject.set_name}${preparedCardName}${Date.now()}.png`;

    try {
        const cardNameUrl = Utils.replaceAll(Utils.removeAllSymbols(preparedCardName, [',', `'`]), ' ', '+');
        const cardSetUrl = Utils.replaceAll(Utils.removeAllSymbols(checkAgainstGoldfishDict(cardObject.set_name), [',', `'`]), ' ', '+');
        const url = `${API_LINKS.MTGGOLDFISH_PRICE}${cardSetUrl}/${cardNameUrl}#paper`;
        await captureWebsite.file(url, imageName, {
            element: '.price-card-history-container',
            scrollToElement: '.price-card-history-container',
            timeout: 10,
            delay: 1,
            launchOptions: {
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]
            }
        });
        const photoObject = await vkApi.upload.messagePhoto({source: {value: path.resolve(imageName)}});
        const cacheObject = await ImageHelper.createItem({
            cardId: cardObject.illustration_id,
            cardObject,
            photoObject,
            trade: true
        });
        fs.unlinkSync(imageName);
        console.log(LOGS.GOLDGISH_IMAGE_DELETED);
        return cacheObject;
    } catch (e) {
        console.log(e);
        console.error(LOGS.GOLDGISH_IMAGE_DELETED);
        return undefined;
    }
}

export async function getGoldfishDeckImage(vkApi: VK, deckId: number): Promise<PhotoAttachment> {

    const imageName = `${deckId}${Date.now()}.png`;

    try {
        const url = `${API_LINKS.MTGGOLDFISH_DECK_VISUAL}${deckId}`;
        await captureWebsite.file(url, imageName, {
            height: 2500,
            element: '.deck-visual-graphic-area',
            scrollToElement: '.deck-visual-graphic-area',
            launchOptions: {
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]
            }
        });
        const photoObject = await vkApi.upload.messagePhoto({source: {value: path.resolve(imageName)}});
        console.log(LOGS.GOLDGISH_IMAGE_DELETED);
        return photoObject;
    } catch (e) {
        console.log(e);
        console.error(LOGS.GOLDGISH_IMAGE_DELETED);
        return undefined;
    } finally {
        fs.unlinkSync(imageName);
    }

}
