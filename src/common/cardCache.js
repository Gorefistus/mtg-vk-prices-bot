const CONSTANTS = require('../common/constants');
const DBHelper = require('../common/db/DBHelper');

class CardCache {
    async getCardFromCache(cardObject, isFoil) {
        let cachedPrice = await DBHelper.getItemFromCollection({
            name: cardObject.name,
            set: cardObject.set_name,
            foil: isFoil,
        }, CONSTANTS.DB_NAME_PRICES);

        if (!this.validateCacheEntry(cachedPrice) && cachedPrice) {
            this.removeEntryFromCache(cachedPrice);
            cachedPrice = undefined;
        }
        return cachedPrice;
    }


    validateCacheEntry(cacheObject) {
        return cacheObject && (Date.now() - cacheObject.cacheDate < CONSTANTS.CACHE_ENTRY_DURATION);
    }

    removeEntryFromCache(cacheObject) {
        if (cacheObject) {
            DBHelper.removeFromCollection(cacheObject, CONSTANTS.DB_NAME_PRICES);
        }
    }


    addCardToCache(cardObject) {
        DBHelper.addItemDocumentToCollection({
            ...cardObject,
            cacheDate: Date.now(),
        }, CONSTANTS.DB_NAME_PRICES)
            .catch(reason => console.log(reason));
    }

}

module.exports = new CardCache();

