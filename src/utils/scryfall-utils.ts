import * as Scry from "scryfall-sdk";
import {Card} from "scryfall-sdk";
import franc from "franc";


import {LANGS, LANGS_SCRY} from "./constants";


// export function getCardByName(cardName: string, setCode?: string): Promise<Card> {
//     return Scry.Cards.byName(cardName, setCode, true);
// }


export function getCardByName(cardName: string, setCode?: string, multilang = false): Promise<Card> {
    cardName = cardName.trim();
    if (setCode) {
        setCode = setCode.toUpperCase();
    }
    return new Promise((resolve, reject) => {
        const lang = franc(cardName, {
            minLength: 3,
            whitelist: [LANGS.LANG_ENG, LANGS.LANG_RUS],
        });
        const searchCard: { name: string, language?: string } = {name: cardName};
        if (LANGS.LANG_RUS === lang) {
            searchCard.language = LANGS_SCRY.LANG_RUS_SCRY;
        } else {
            searchCard.language = LANGS_SCRY.LANG_ENG_SCRY;
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
                }).on('done', () => {
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
            }).on('done', () => {
                console.log('card not found');
                reject(undefined);
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
                }).on("done", () => {
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
                    }).on('done', () => {
                    //TODO we are done search has failed
                    reject(undefined);
                });
            });
        }
    });
}
