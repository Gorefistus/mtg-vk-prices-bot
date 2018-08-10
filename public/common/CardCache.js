const CONSTANTS = require('../common/constants');


class CardCache {
    constructor() {
        this.cardCache = [];
    }


    getCardFromCache(cardObject, isFoil) {
        let cardObjectToReturn;
        let i = 0;
        for (const card of this.cardCache) {
            if (card.name === cardObject.name && card.set === cardObject.set_name && card.foil === isFoil) {
                if (this.validateCacheEntry(i)) {
                    cardObjectToReturn = card;
                    break;
                } else {
                    this.removeEntryFromCache(i);
                    break;
                }
            }
            i++;
        }
        return cardObjectToReturn;
    }


    validateCacheEntry(cacheIndex) {
        return cacheIndex < this.cardCache.length && (Date.now() - this.cardCache[cacheIndex].cacheDate < CONSTANTS.CACHE_ENTRY_DURATION);
    }

    removeEntryFromCache(cacheIndex) {
        if (cacheIndex > -1) {
            this.cardCache.splice(cacheIndex, 1);
        }
    }


    addCardToCache(cardObject) {
        this.cardCache.push({
            ...cardObject,
            cacheDate: Date.now(),
        });
    }

    _printArrayStructure() {
        console.log(this.cardCache);
    }

    _invalidateCache() {
        this.cardCache.length = 0;
    }
}

module.exports = new CardCache();

