import { FilterQuery, UpdateQuery } from "mongodb";

import { DbEntityInterface } from "../../types/db-entity";
import { DB_CONSTANTS, DB_NAMES } from "../constants";
import { ImageCache, ImageCacheSearch } from "../../types/image-cache";
import DBHelper from "./db-helper";


class ImageHelper implements DbEntityInterface {
    dbName: string;


    constructor() {
        this.dbName = DB_NAMES.IMAGES;
    }


    async createItem(item: FilterQuery<ImageCache>): Promise<ImageCache> {
        if (item.photoObject && item.cardObject) {
            // broken fields for mongo serialization, also useless for our app
            delete item.photoObject.$filled;
            delete item.photoObject.vk;
            if (!item.cacheDate) {
                item.cacheDate = Date.now();
            }
            DBHelper.addItemDocumentToCollection(item, this.dbName);
            return <ImageCache>item;
        }
        return undefined;
    }

    async deleteItem(item: FilterQuery<ImageCacheSearch>): Promise<boolean> {
        return await DBHelper.removeFromCollection(item, this.dbName);
    }

    async getItem(item: FilterQuery<ImageCacheSearch>): Promise<ImageCache> {
        const imageFromCache = await DBHelper.getItemFromCollection(item, this.dbName);
        if (imageFromCache && imageFromCache.trade && this.validateCacheEntry(imageFromCache.cacheDate)) {
            return <ImageCache>imageFromCache;
        } else if (imageFromCache && (imageFromCache.art || !imageFromCache.trade)) {
            return <ImageCache>imageFromCache;
        }
        this.deleteItem(item);
        return undefined;
    }

    updateItem(item: FilterQuery<any>, fields: UpdateQuery<any>): Promise<boolean> {
        return undefined;
    }

    validateCacheEntry(date: number): boolean {
        if (date) {
            return Date.now() - date < DB_CONSTANTS.CACHE_EXPIRE_DURATION;
        }
        return false;
    }


}


export default new ImageHelper();
