const constants = require('./constants');
const strings = require('./strings');
const request = require('request');
const fs = require('fs');
const mtg = require('mtgsdk');
const franc = require('franc');
const Scry = require("scryfall-sdk");


function getLegality(legality) {
    switch (legality) {
        case constants.LEGALITY_LEGAL:
            return strings.LEGALITY_LEGAL;
        case constants.LEGALITY_BANNED:
            return strings.LEGALITY_BANNED;
        case constants.LEGALITY_NOT_LEGAL:
            return strings.LEGALITY_NOT_LEGAL;
        case constants.LEGALITY_RESTRICTED:
            return strings.LEGALITY_RESTRICTED;
    }
}


function downloadCardImage(uri, callback) {
    request.head(uri, (err, res, body) => {
        const fileName = Date.now().toString() + '.jpg';
        request(uri).pipe(fs.createWriteStream(fileName)).on('close', () => callback(fileName));
    });
}


function getCardByName(cardName, setCode) {
    cardName = cardName.trim();
    if (setCode) {
        setCode = setCode.toUpperCase();
    }
    return new Promise((resolve, reject) => {
        const lang = franc(cardName, {minLength: 3, whitelist: [constants.LANG_ENG, constants.LANG_RUS]});
        const searchCard = {name: cardName};
        if (constants.LANG_RUS === lang) {
            searchCard.language = strings.LANG_RUS;
        }
        mtg.card.where(searchCard)
            .then(results => {
                if (results.length > 0 && results.length <= 5) {
                    if (setCode) {
                        Scry.Cards.search(`!"${results[0].name}" set:${setCode} `).on('data', card => {
                            resolve(card);
                        }).on("error", reason => {
                            reject(reason);
                        }).on("end", () => reject(undefined));
                    } else {
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].multiverseid) {
                                Scry.Cards.byMultiverseId(results[i].multiverseid).then(value => {
                                    resolve(value)
                                }, reason => reject(reason));
                            }
                        }
                    }

                } else {
                    if (setCode) {
                        Scry.Cards.search(`!"${results[0].name}" set:${setCode} `).on('data', card => {
                            resolve(card);
                        }).on("error", reason => {
                            reject(reason);
                        }).on("end", () => reject(undefined));
                    } else {
                        Scry.Cards.byName(cardName, true).then(value => resolve(value), reason => reject(reason));

                    }
                }
            }, reason => reject(reason));
    });
}


module.exports = {
    getLegality,
    downloadCardImage,
    getMultiverseId: getCardByName
};