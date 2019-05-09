export interface AuctionWatcher {
    userId: number;
    watchlist: Array<string>;
    foundAuctions: Array<{ id: number, aucId: string }>;
    cacheDate?: number;
}


export interface AuctionWatcherSearch {
    userId: number;
}
