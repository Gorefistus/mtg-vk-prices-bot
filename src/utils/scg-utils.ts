import { Card } from 'scryfall-sdk';
import cheerio from 'cheerio';
import axios from 'axios';

import ScgDict from './scg-set-dictionary';
import { SCGPrice, ScgPriceObj } from 'price-cache';


export async function getStartCityPrices(htmlString: string, cardObject: Card): Promise<SCGPrice> {
    if (!cardObject) {
        return undefined;
    }
    const scgCard = <SCGPrice>{};
    scgCard.normal = await parsePrices(htmlString, cardObject);
    scgCard.foil = await parsePrices(htmlString, cardObject, true);

    return scgCard.normal ? scgCard : undefined;
}

async function parsePrices(htmlString: string, cardObject: Card, isFoil = false): Promise<ScgPriceObj> {
    let valueToReturn = <ScgPriceObj>{};
    const htmlPage = cheerio.load(htmlString);

    const foundIds: Array<number> = [];
    htmlPage(`tr[data-id]`).each(function (index, element) {
        const dataName = element.attribs['data-name'].toLowerCase();
        if (dataName.includes(cardObject.name.toLowerCase()) && dataName.includes(cardObject.set.toLowerCase()) && dataName.includes(cardObject.collector_number.toString())) {
            const elemId = Number(element.attribs['data-id']);
            if (!Number.isNaN(elemId)) {
                foundIds.push(elemId);
            }
        }
    });
    try {
        if (foundIds.length === 0) {
            return undefined;
        }
        let idToUse = foundIds[0];
        if (isFoil) {
            if (foundIds.length < 2) {
                return undefined;
            }
            idToUse = foundIds[1];
        }
        const priceObjectRequest = await axios.get(`https://newstarcityconnector.herokuapp.com/eyApi/products/${idToUse}/variants`);
        const priceObject = priceObjectRequest.data.response.data[0];
        valueToReturn.value = priceObject.price;
        valueToReturn.stock = priceObject.inventory_level;
        valueToReturn.set = cardObject.set_name;
    } catch (e) {
        valueToReturn = undefined;
    }
    return valueToReturn;

}
