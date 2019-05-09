import { Card } from 'scryfall-sdk';
import cheerio from 'cheerio';

import ScgDict from './scg-set-dictionary';
import { SCGPrice, ScgPriceObj } from 'price-cache';


export function getStartCityPrices(htmlString: string, cardObject: Card): SCGPrice {
    if (!cardObject) {
        return undefined;
    }
    const scgCard = <SCGPrice>{};
    scgCard.normal = parsePrices(htmlString, cardObject);
    scgCard.foil = parsePrices(htmlString, cardObject, true);

    return scgCard.normal ? scgCard : undefined;
}

function parsePrices(htmlString: string, cardObject: Card, isFoil = false): ScgPriceObj {
    let valueToReturn = <ScgPriceObj>{};
    const htmlPage = cheerio.load(htmlString);

    let scgCardIndex = -1;

    htmlPage('.search_results_2')
        .each(function (i) {
            if (checkAgainstSCGDict(htmlPage(this)
                .text()
                .trim(), isFoil)
                .toLowerCase() === `${cardObject.set_name}${isFoil ? ' (Foil)' : ''}`.toLowerCase()) {
                scgCardIndex = i;
                valueToReturn.set = cardObject.set_name;
            }
        });
    if (scgCardIndex >= 0) {
        valueToReturn.value = htmlPage('.search_results_9')
            .eq(scgCardIndex)
            .text();
        valueToReturn.stock = htmlPage('.search_results_8')
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
            valueToReturn.value = htmlPage('.search_results_9')
                .eq(scgCardIndex)
                .text();
            valueToReturn.set = htmlPage('.search_results_2')
                .eq(scgCardIndex)
                .text();
            valueToReturn.stock = htmlPage('.search_results_8')
                .eq(scgCardIndex)
                .text();
        } else {
            valueToReturn = undefined;
        }
    } else {
        try {
            valueToReturn.set = htmlPage('.search_results_2')
                .first()
                .text()
                .trim();
            valueToReturn.value = htmlPage('.search_results_9')
                .first()
                .text()
                .trim();
            valueToReturn.stock = htmlPage('.search_results_8')
                .eq(scgCardIndex)
                .text();
            valueToReturn.name = cardObject.name;
        } catch (e) {
            valueToReturn = undefined;
        }
    }
    return valueToReturn;
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
