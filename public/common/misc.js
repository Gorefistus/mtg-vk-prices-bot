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


function getCardByName(cardName) {
    return new Promise((resolve, reject) => {
        const lang = franc(cardName, {minLength: 3, whitelist: [constants.LANG_ENG, constants.LANG_RUS]});
        mtg.card.where({
            name: cardName,
            language: `${constants.LANG_RUS === lang ? strings.LANG_RUS : strings.LANG_ENG}`
        })
            .then(results => {
                if (results.length <= 3) {
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].multiverseid) {
                            Scry.Cards.byMultiverseId(results[i].multiverseid).then(value => {
                                resolve(value)
                            }, reason => reject(reason));
                        }
                    }

                } else {
                    Scry.Cards.byName(cardName, true).then(value => resolve(value), reason => reject(reason));
                }
            }, reason => reject(reason));
    });
}


module.exports = {
    getLegality,
    downloadCardImage,
    getMultiverseId: getCardByName
};