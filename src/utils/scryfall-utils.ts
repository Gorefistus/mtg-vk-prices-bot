import {Card} from "scryfall-sdk";

const Scry = require('scryfall-sdk');


export function getCardByName(cardName: string, setCode?: string): Promise<Card> {
    return new Promise<Card>((resolve, reject) => {
        Scry.Cards.search(`${cardName} lang:any`).on('data', (card: Card) => {
            resolve(card);
        }).on("error", (err: Error) => {
            reject(err);
        });
    });
}
