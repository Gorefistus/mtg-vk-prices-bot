import { Card } from 'scryfall-sdk';
import cheerio from 'cheerio';
import axios from 'axios';

import { SCGPrice, ScgPriceObj } from 'price-cache';

const foilIndicator = 'enf';
const normalIndicator = 'enn';
const nm = 'near mint';


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
        if ((dataName.includes(cardObject.name.toLowerCase()) && dataName.includes(cardObject.set.toLowerCase()) && dataName.includes(cardObject.collector_number.toString())) && (isFoil ? dataName.includes(foilIndicator) : dataName.includes(normalIndicator))) {
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
        const idToUse = foundIds[0];
        const priceObjectRequest = await axios.get(`https://newstarcityconnector.herokuapp.com/eyApi/products/${idToUse}/variants`);
        // @ts-ignore
        const priceObject = priceObjectRequest.data.response.data.find((scgPrice) => {
            return scgPrice.option_values[0].label.toLowerCase() === nm;
        });
        valueToReturn.value = `$${priceObject.price}`;
        valueToReturn.stock = priceObject.inventory_level;
        valueToReturn.set = cardObject.set_name;
    } catch (e) {
        valueToReturn = undefined;
    }
    return valueToReturn;

}
