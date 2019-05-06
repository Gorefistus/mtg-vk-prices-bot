import { DbEntityInterface } from 'db-entity';
import { FilterQuery, UpdateQuery } from 'mongodb';
import { PriceCache, PriceCacheSearch } from 'price-cache';
import { DB_CONSTANTS } from '../constants';


class PriceHelper implements DbEntityInterface {
    dbName: string;

    createItem(item: FilterQuery<PriceCache>): Promise<any> {
        return undefined;
    }

    deleteItem(item: FilterQuery<PriceCacheSearch>): Promise<boolean> {
        return undefined;
    }

    getItem(item: FilterQuery<PriceCacheSearch>): Promise<any> {
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
