import {Card} from "scryfall-sdk";
import cheerio from 'cheerio';

import ScgDict from './scg-set-dictionary';
import {SCGPrice} from "price-cache";


export function getStartCityPrices(htmlString: string, cardObject: Card, isFoil = false): SCGPrice {
    if (!cardObject) {
        return undefined;
    }
    const htmlPage = cheerio.load(htmlString);
    let SCGCard: SCGPrice = undefined;
    let scgCardIndex = -1;
    htmlPage('.search_results_2')
        .each(function (i) {
            if (checkAgainstSCGDict(htmlPage(this)
                .text()
                .trim(), isFoil)
                .toLowerCase() === `${cardObject.set_name}${isFoil ? ' (Foil)' : ''}`.toLowerCase()) {
                scgCardIndex = i;
                SCGCard.set = cardObject.set_name;
            }
        });
    if (scgCardIndex >= 0) {
        SCGCard.value = htmlPage('.search_results_9')
            .eq(scgCardIndex)
            .text();
        SCGCard.stock = htmlPage('.search_results_8')
            .eq(scgCardIndex)
            .text();
    } else if (isFoil) {
        scgCardIndex = -1;
        htmlPage('.search_results_2')
            .each(function (i) {
                if (htmlPage(this)
                    .text()
                    .trim()
                    .includes('(Foil)')) {
                    scgCardIndex = i;
                }
            });
        if (scgCardIndex >= 0) {
            SCGCard.value = htmlPage('.search_results_9')
                .eq(scgCardIndex)
                .text();
            SCGCard.set = htmlPage('.search_results_2')
                .eq(scgCardIndex)
                .text();
            SCGCard.stock = htmlPage('.search_results_8')
                .eq(scgCardIndex)
                .text();
        } else {
            SCGCard = undefined;

        }
    } else {
        try {
            SCGCard.set = htmlPage('.search_results_2')
                .first()
                .text()
                .trim();
            SCGCard.value = htmlPage('.search_results_9')
                .first()
                .text()
                .trim();
            SCGCard.stock = htmlPage('.search_results_8')
                .eq(scgCardIndex)
                .text();
            SCGCard.name = cardObject.name;
        } catch (e) {
            SCGCard = undefined;
        }
    }
    return SCGCard;
}


function checkAgainstSCGDict(setName: string, isFoil = false): string {
    let setNameToReturn = setName;
    ScgDict.forEach((scgDictItem) => {
        if ((isFoil ? setName.split('(Foil)')[0].trim()
            .toLowerCase() : setName.toLowerCase()) === scgDictItem.scg.toLowerCase()) {
            setNameToReturn = `${scgDictItem.scry}${isFoil ? ' (Foil)' : ''}`;
        }
    });
    return setNameToReturn;
}
