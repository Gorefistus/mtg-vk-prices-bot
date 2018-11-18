const CONSTANTS = require('../common/constants');
const DBHelper = require('../common/db/DBHelper');


/**
 *  Cache object is looking like this {photoObject:'vk photo object', cardObject:{id, name, set}, trade:'only present if this is a card price graph from MTGGOLDFISH {timeOfCreation}' }
 *
 *
 */

class ImageVkCache {

    addCacheObject(photoObject, cardObject, options) {
        const searchObject = {
            photoObject,
            cardObject,
            cacheDate: Date.now(),
            trade: options && options.isTrade ? true : undefined,
            art: options && options.isArt ? true : undefined,
            cardId: cardObject.id,
        };
        DBHelper.addItemDocumentToCollection(searchObject, CONSTANTS.DB_NAME_IMAGES)
            .catch(reason => console.log(reason));
    }


    async getPhotoObj(cardId, options) {
        const searchObject = { cardId };
        if (options) {
            if (options.isArt) {
                searchObject.art = true;
            }
            if (options.isTrade) {
                searchObject.trade = true;
            }
        }
        let cachedImage = await DBHelper.getItemFromCollection(searchObject, CONSTANTS.DB_NAME_IMAGES);
        if (!this.validateCacheEntry(cachedImage) && cachedImage && cachedImage.trade) {
            this.removeEntryFromCache(cachedImage);
            cachedImage = undefined;
        }
        return cachedImage;
    }


    validateCacheEntry(cacheObject) {
        return cacheObject && (Date.now() - cacheObject.cacheDate < CONSTANTS.CACHE_ENTRY_DURATION);
    }

    removeEntryFromCache(cacheObject) {
        if (cacheObject) {
            DBHelper.removeFromCollection(cacheObject, CONSTANTS.DB_NAME_IMAGES);
        }
    }

}


module.exports = new ImageVkCache();
