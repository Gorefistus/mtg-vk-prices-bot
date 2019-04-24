export interface PriceCache {
    cacheDate?: number;
    cardName: string,
    cardSet: string,
    cardId: string;
    SCGPrice: SCGPrice;
    TopDeckPrice: TopDeckPrice;
}


export interface PriceCacheSearch {
    cardId: string;
}


export interface SCGPrice {
    value: string;
    stock: string;
    name: string;
    set: string;
}

export interface TopDeckPrice {
    value: string;
}
