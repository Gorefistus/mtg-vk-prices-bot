const Fuse = require('fuse.js');

/**
 *  Cache object is looking like this {photoObject:'vk photo object', cardObject:{id, name, set}, trade:'only present if this is a card price graph from MTGGOLDFISH {timeOfCreation}' }
 *
 *
 */

class ImageVkCache {
    constructor() {
        this._imageCache = [];
        this.searchHelper = undefined;
        this._initializeFuzeSearch();
    }


    _initializeFuzeSearch() {
        const options = {
            shouldSort: true,
            includeScore: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [
                'tags',
            ],
        };
        this.searchHelper = new Fuse(this._imageCache, options);
    }


    addCacheObject(photoObject, cardObject, options){
        const searchObject = {
            photoObject,
            cardObject,
            trade: options && options.isTrade ? Date.now() : undefined,
            art: options && options.isArt ? true : undefined,
            tags: [`${cardObject.id}`],
        };
        this._imageCache.push(searchObject);
        this._initializeFuzeSearch();
    }


    getPhotoObj(cardId, options) {
        const result = this.searchHelper.search(`${cardId}`)
            .filter((value) => {
                if (options && options.isTrade) {
                    return value.score === 0 && value.item.trade;
                } else if (options && options.isArt) {
                    console.log(value.item.art, value.score === 0 && value.item.art);
                    return value.score === 0 && value.item.art;
                }
                return value.score === 0;
            });
        return result[0];
    }


}


module.exports = new ImageVkCache();
