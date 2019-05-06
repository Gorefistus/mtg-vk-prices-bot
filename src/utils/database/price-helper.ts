import {DbEntityInterface} from 'db-entity';
import {FilterQuery, UpdateQuery} from 'mongodb';
import {PriceCache, PriceCacheSearch} from 'price-cache';
import {DB_CONSTANTS, DB_NAMES} from '../constants';
import DBHelper from "./db-helper";


class PriceHelper implements DbEntityInterface {
    dbName: string;

    constructor() {
        this.dbName = DB_NAMES.PRICES;
    }

    async createItem(item: FilterQuery<PriceCache>): Promise<PriceCache> {
        if (!item.cacheDate) {
            item.cacheDate = Date.now();
        }
        DBHelper.addItemDocumentToCollection(item, this.dbName);
        return <PriceCache>item;
    }

    async deleteItem(item: FilterQuery<PriceCacheSearch>): Promise<boolean> {
        return await DBHelper.removeFromCollection(item, this.dbName);
    }

    async getItem(item: FilterQuery<PriceCacheSearch>): Promise<PriceCache> {
        const priceFromCache = await DBHelper.getItemFromCollection(item, this.dbName);
        if (priceFromCache && this.validateCacheEntry(priceFromCache.cacheDate)) {
            return <PriceCache>priceFromCache;
        }
        this.deleteItem(item);
        return undefined;
    }

    updateItem(item: UpdateQuery<PriceCacheSearch>): Promise<boolean> {
        return undefined;
    }

    validateCacheEntry(date: number): boolean {
        if (date) {
            return Date.now() - date < DB_CONSTANTS.CACHE_EXPIRE_DURATION;
        }
        return false;
    }

}

export default new PriceHelper();
