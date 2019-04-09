import {DbEntityInterface} from "../../types/db-entity";
import {FilterQuery, UpdateQuery} from "mongodb";
import {DB_CONSTANTS, DB_NAMES} from "../constants";
import {ImageCache, ImageCacheSearch} from "../../types/image-cache";
import DBHelper from "./db-helper";


class ImageHelper implements DbEntityInterface {
    dbName: string;


    constructor() {
        this.dbName = DB_NAMES.IMAGES;
    }


    async createItem(item: FilterQuery<ImageCache>): Promise<ImageCache> {
        if (item.photoObject && item.cardObject) {
            if (!item.cacheDate) {
                item.cacheDate = Date.now();
            }
            DBHelper.addItemDocumentToCollection(item, this.dbName);
            return <ImageCache>item;
        }
        return undefined;
    }

    deleteItem(item: FilterQuery<ImageCacheSearch>): Promise<boolean> {
        return undefined;
    }

    async getItem(item: FilterQuery<ImageCacheSearch>): Promise<ImageCache> {
        let imageFromCache = await DBHelper.getItemFromCollection(item, this.dbName);
        if (imageFromCache && imageFromCache.trade && this.validateCacheEntry(imageFromCache.cacheDate)) {
            return <ImageCache>imageFromCache;
        }
        return <ImageCache>imageFromCache;
    }

    updateItem(item: UpdateQuery<ImageCacheSearch>): Promise<boolean> {
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
