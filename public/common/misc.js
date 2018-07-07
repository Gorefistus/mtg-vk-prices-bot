const fs = require('fs');
const Scry = require('scryfall-sdk');
const cheerio = require('cheerio');
const request = require('request');


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
    case CONSTANTS.LANG_RUS:
        return STRINGS.LANG_RUS;
    case CONSTANTS.LANG_ENG:
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


function getCardByName(cardName, setCode) {
    cardName = cardName.trim();
    if (setCode) {
        setCode = setCode.toUpperCase();
    }
    return new Promise((resolve, reject) => {
        // First, we are trying to get the card with exact name as provided,
        // if we fail, we are doing fluffy search
        if (setCode) {
            Scry.Cards.search(`!"${cardName}" set:${setCode}  `)
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
                    Scry.Cards.search(`${cardName} set:${setCode} lang:any `)
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
            Scry.Cards.search(`!"${cardName}" lang:any } `)
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
                    Scry.Cards.search(`${cardName} lang:any`)
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

function getStarCityPrice(htmlString, cardObject = undefined) {
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
                .trim())
                .toLowerCase() === cardObject.set_name.toLowerCase()) {
                scgCardIndex = i;
                SCGCard.set = cardObject.set_name;
            }
        });
    if (scgCardIndex >= 0) {
        SCGCard.value = htmlPage('.search_results_9')
            .eq(scgCardIndex)
            .text();
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

function checkAgainstSCGDict(setName) {
    let setNameToReturn = setName;
    SCGDict.SCGDict.forEach((scgDictItem) => {
        if (setName.toLowerCase() === scgDictItem.scg.toLowerCase()) {
            setNameToReturn = scgDictItem.scry;
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
};
