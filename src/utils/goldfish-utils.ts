import * as path from 'path';
import fs from 'fs';
import phantom from 'phantom';


import GoldfishDict from './goldfish-set-dictionary';
import * as Utils from './utils';
import { API_LINKS } from './constants';
import { LOGS } from './strings';
import ImageHelper from './database/image-helper';
import { Card } from 'scryfall-sdk';
import { ImageCache } from 'image-cache';
import VK from 'vk-io';


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
        const instance = await phantom.create([], {
            logLevel: 'error',
        });
        const page = await instance.createPage();
        const cardNameUrl = Utils.replaceAll(Utils.removeAllSymbols(preparedCardName, [',', `'`]), ' ', '+');
        const cardSetUrl = Utils.replaceAll(Utils.removeAllSymbols(checkAgainstGoldfishDict(cardObject.set_name), [',', `'`]), ' ', '+');
        const url = `${API_LINKS.MTGGOLDFISH_PRICE}${cardSetUrl}/${cardNameUrl}#paper`;
        await page.open(url);
        const clipRect = await page.evaluate(function () {
            return document.querySelector('#tab-paper')
                .getBoundingClientRect();
        });
        page.property('clipRect', {
            top: clipRect.top,
            left: clipRect.left,
            width: clipRect.width,
            height: clipRect.height,
        });
        page.render(imageName);
        await instance.exit();
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
