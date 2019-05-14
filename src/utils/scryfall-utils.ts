import * as Scry from 'scryfall-sdk';
import { Card } from 'scryfall-sdk';
import franc from 'franc';


import { LANGS, LANGS_SCRY } from './constants';


// export function getCardByName(cardName: string, setCode?: string): Promise<Card> {
//     return Scry.Cards.byName(cardName, setCode, true);
// }


export function getCardByName(cardName: string, setCode?: string, multilang = false): Promise<Card> {
    cardName = cardName.trim();
    if (setCode) {
        setCode = setCode.toUpperCase();
    }
    return new Promise(async (resolve, reject) => {
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
        try {
            let cards = await Scry.Cards.search(`!"${cardName}" ${setCode ? `set:${setCode}` : ''} lang:${multilang ? 'any' : searchCard.language}`).waitForAll();
            if (cards.length > 0) {
                resolve(cards[0]);
            } else {
                cards = await Scry.Cards.search(`${cardName} ${setCode ? `set:${setCode}` : ''} lang:${multilang ? 'any' : searchCard.language}`).waitForAll();
            }
            if (cards.length > 0) {
                resolve(cards[0]);

            } else {
                console.log('card not found');
                reject(undefined);
            }
        } catch (e) {
            reject(undefined);
        }

    });
}
