import { FilterQuery, UpdateQuery } from 'mongodb';


import { DbEntityInterface } from 'db-entity';
import { DB_NAMES } from '../constants';
import { AuctionWatcher, AuctionWatcherSearch } from 'auction-watcher';
import DBHelper from './db-helper';


class AuctionsHelper implements DbEntityInterface {
    dbName: string;


    constructor() {
        this.dbName = DB_NAMES.AUCTIONS;
    }

    async createItem(item: FilterQuery<AuctionWatcher>): Promise<AuctionWatcher> {
        if (!item.cacheDate) {
            item.cacheDate = Date.now();
        }

        if (!item.foundAuctions) {
            item.foundAuctions = [];
        }
        DBHelper.addItemDocumentToCollection(item, this.dbName);
        return <AuctionWatcher>item;
    }

    async deleteItem(item: FilterQuery<AuctionWatcherSearch>): Promise<boolean> {
        return undefined;
    }

    async getItem(item: FilterQuery<AuctionWatcherSearch>): Promise<AuctionWatcher> {
        const watcher = await DBHelper.getItemFromCollection(item, this.dbName);
        return <AuctionWatcher>watcher;
    }

    async getAllItems(): Promise<Array<AuctionWatcher>> {
        const allWatchers = await DBHelper.getAllItemsFromCollection(this.dbName);
        return <Array<AuctionWatcher>>allWatchers;
    }

    updateItem(item: FilterQuery<AuctionWatcherSearch>, fields: UpdateQuery<{ watchlist: Array<string>, cacheDate?: number, foundAuctions: Array<string> }>): Promise<boolean> {
        return DBHelper.updateItemInCollection(item, fields, this.dbName);
    }

    validateCacheEntry(date: number): boolean {
        return false;
    }


}


export default new AuctionsHelper();



