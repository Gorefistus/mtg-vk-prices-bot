export interface ImageCache {
    photoObject: any,
    cardObject: any,
    cacheDate?: number,
    trade?: boolean,
    art?: boolean,
    cardId: string,
}

export interface ImageCacheSearch {
    cardId: string,
    trade?: boolean,
    art?: boolean,
}
