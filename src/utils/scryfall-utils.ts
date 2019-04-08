import { Card } from "scryfall-sdk";

const Scry = require('scryfall-sdk');


export function getCardByName(cardName: string, setCode?: string): Promise<Card> {
    return Scry.Cards.byName(cardName, setCode, true);
}
