const fs = require('fs');
const Scry = require('scryfall-sdk');
const cheerio = require('cheerio');
const request = require('request');
const franc = require('franc');


const SCGDict = require('./SCGSetDictionary');
const CONSTANTS = require('./constants');
const STRINGS = require('./strings');


function getLegality(legality) {
    switch (legality) {
        case CONSTANTS.LEGALITY_LEGAL:
            return STRINGS.LEGALITY_LEGAL;
        case CONSTANTS.LEGALITY_BANNED:
            return STRINGS.LEGALITY_BANNED;
        case CONSTANTS.LEGALITY_NOT_LEGAL:
            return STRINGS.LEGALITY_NOT_LEGAL;
        case CONSTANTS.LEGALITY_RESTRICTED:
            return STRINGS.LEGALITY_RESTRICTED;
        default:
            return STRINGS.LEGALITY_NOT_LEGAL;
    }
}


function getLanguageByLangCode(langCode) {
    switch (langCode) {
        case CONSTANTS.LANG_DE:
            return STRINGS.LANG_DE;
        case CONSTANTS.LANG_RUS_SCRY:
            return STRINGS.LANG_RUS;
        case CONSTANTS.LANG_ENG_SCRY:
            return STRINGS.LANG_ENG;
        case CONSTANTS.LANG_ESP:
            return STRINGS.LANG_ESP;
        case CONSTANTS.LANG_FR:
            return STRINGS.LANG_FR;
        case CONSTANTS.LANG_IT:
            return STRINGS.LANG_IT;
        case CONSTANTS.LANG_PT:
            return STRINGS.LANG_PT;
        case CONSTANTS.LANG_JA:
            return STRINGS.LANG_JA;
        case CONSTANTS.LANG_KO:
            return STRINGS.LANG_KO;
        case CONSTANTS.LANG_ZHT:
            return STRINGS.LANG_ZHT;
        case CONSTANTS.LANG_ZHS:
            return STRINGS.LANG_ZHS;
        case CONSTANTS.LANG_HE:
            return STRINGS.LANG_HE;
        case CONSTANTS.LANG_LA:
            return STRINGS.LANG_LA;
        case CONSTANTS.LANG_GRC:
            return STRINGS.LANG_GRC;
        case CONSTANTS.LANG_AR:
            return STRINGS.LANG_AR;
        case CONSTANTS.LANG_SA:
            return STRINGS.LANG_SA;
        case CONSTANTS.LANG_PX:
            return STRINGS.LANG_PX;
        default:
            return STRINGS.LANG_ENG;
    }
}


function delay(delayTime = 100) {
    return new Promise((resolve) => {
        setTimeout(resolve, delayTime);
    });
}

function promiseReflect(promise) {
    return promise.then(
        v => ({
            v,
            status: 'resolved',
        }),
        e => ({
            e,
            status: 'rejected',
        }),
    );
}


function downloadCardImage(uri) {
    return new Promise((resolve, reject) => {
        try {
            request.head(uri, () => {
                const fileName = `${Date.now()
                    .toString()}.jpg`;
                request(uri)
                    .pipe(fs.createWriteStream(fileName))
                    .on('close', () => resolve(fileName));
            });
        } catch (e) {
            reject(e);
        }
    });
}


function getCardByName(cardName, setCode, multilang = false) {
    cardName = cardName.trim();
    if (setCode) {
        setCode = setCode.toUpperCase();
    }
    return new Promise((resolve, reject) => {
        const lang = franc(cardName, {
            minLength: 3,
            whitelist: [CONSTANTS.LANG_ENG, CONSTANTS.LANG_RUS],
        });
        const searchCard = { name: cardName };
        if (CONSTANTS.LANG_RUS === lang) {
            searchCard.language = CONSTANTS.LANG_RUS_SCRY;
        }

        // First, we are trying to get the card with exact name as provided,
        // if we fail, we are doing fluffy search
        if (setCode) {
            Scry.Cards.search(`!"${cardName}" set:${setCode} lang:${multilang ? 'any' : searchCard.language}`)
                .on('data', (card) => {
                    if (!card.card_faces && !card.image_uris) {
                        Scry.Cards.search(`"${cardName}" set:${setCode}`)
                            .on('data', data => resolve(data))
                            .on('error', err => reject(err));
                    } else {
                        resolve(card);
                    }
                })
                .on('error', () => {
                    Scry.Cards.search(`${cardName} set:${setCode} lang:${multilang ? 'any' : searchCard.language}`)
                        .on('data', (card) => {
                            if (!card.card_faces && !card.image_uris) {
                                Scry.Cards.search(`"${cardName}" set:${setCode}`)
                                    .on('data', data => resolve(data))
                                    .on('error', err => reject(err));
                            } else {
                                resolve(card);
                            }
                        })
                        .on('error', (reason) => {
                            reject(reason);
                        });
                });
        } else {
            Scry.Cards.search(`!"${cardName}" lang:${multilang ? 'any' : searchCard.language}`)
                .on('data', (card) => {
                    if (!card.card_faces && !card.image_uris) {
                        Scry.Cards.byName(card.name, true)
                            .then(
                                value => resolve(value),
                                reason => reject(reason),
                            );
                    } else {
                        resolve(card);
                    }
                })
                .on('error', () => {
                    Scry.Cards.search(`${cardName} lang:${multilang ? 'any' : searchCard.language}`)
                        .on('data', (card) => {
                            if (!card.card_faces && !card.image_uris) {
                                Scry.Cards.byName(card.name, true)
                                    .then(
                                        value => resolve(value),
                                        reason => reject(reason),
                                    );
                            } else {
                                resolve(card);
                            }
                        })
                        .on('error', (reason) => {
                            reject(reason);
                        });
                });
        }
    });
}

function getStarCityPrice(htmlString, cardObject = undefined, isFoil = false) {
    if (!cardObject) {
        return undefined;
    }
    const htmlPage = cheerio.load(htmlString);
    let SCGCard = {};
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
            SCGCard.name = cardObject.name;
        } catch (e) {
            SCGCard = undefined;
        }
    }
    return SCGCard;
}

function checkAgainstSCGDict(setName, isFoil = false) {
    let setNameToReturn = setName;
    SCGDict.forEach((scgDictItem) => {
        if ((isFoil ? setName.split('(Foil)')[0].trim()
            .toLowerCase() : setName.toLowerCase()) === scgDictItem.scg.toLowerCase()) {
            setNameToReturn = `${scgDictItem.scry}${isFoil ? ' (Foil)' : ''}`;
        }
    });
    return setNameToReturn;
}

module.exports = {
    getLegality,
    downloadCardImage,
    getMultiverseId: getCardByName,
    promiseReflect,
    delay,
    getStarCityPrice,
    getLanguageByLangCode,
};
