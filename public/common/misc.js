const fs = require('fs');
const franc = require('franc');
const Scry = require('scryfall-sdk');

const CONSTANTS = require('./constants');
const STRINGS = require('./strings');
const request = require('request');


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
        const lang = franc(cardName, {
            minLength: 3,
            whitelist: [CONSTANTS.LANG_ENG, CONSTANTS.LANG_RUS],
        });
        const searchCard = { name: cardName };
        if (CONSTANTS.LANG_RUS === lang) {
            searchCard.language = STRINGS.LANG_RUS;
        }
        if (setCode) {
            Scry.Cards.search(`!"${cardName}" set:${setCode} lang:${searchCard.language} `)
                .on('data', (card) => {
                    if (!card.card_faces && !card.image_uris) {
                        Scry.Cards.search(`!"${cardName}" set:${setCode}`)
                            .on('data', data => resolve(data))
                            .on('error', err => reject(err));
                    } else {
                        resolve(card);
                    }
                })
                .on('error', (reason) => {
                    reject(reason);
                });
        } else {
            Scry.Cards.search(`!"${cardName}" lang:${searchCard.language} `)
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
        }
    });
}


module.exports = {
    getLegality,
    downloadCardImage,
    getMultiverseId: getCardByName,
    promiseReflect,
};
