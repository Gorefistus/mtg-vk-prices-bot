export interface PriceCache {
    cacheDate?: number;
    cardName: string,
    cardSet: string,
    cardId: string;
    foil?: boolean;
    SCGPrice: SCGPrice;
    TopDeckPrice: TopDeckPrice;
}


export interface PriceCacheSearch {
    cardId: string;
    foil?: boolean;
}


export interface SCGPrice {
    value?: string;
    stock?: string;
    name?: string;
    set?: string;
}

export interface TopDeckPrice {
    value: string;
}
