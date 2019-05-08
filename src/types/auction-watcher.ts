
export interface AuctionWatcher {
    userId: number;
    watchlist: Array<string>;
    foundAuctions: Array<string>;
    cacheDate?: number;
}


export interface AuctionWatcherSearch {
    userId: number;
}
