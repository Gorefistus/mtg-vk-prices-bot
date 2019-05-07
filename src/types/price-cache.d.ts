export interface PriceCache {
    cacheDate?: number;
    cardName: string;
    cardSet: string;
    cardId: string;
    scgPrice: SCGPrice;
    topdeckPrice: TopDeckPriceCache;
}


export interface PriceCacheSearch {
    cardId: string;
    foil?: boolean;
}


export interface SCGPrice {
    normal: ScgPriceObj;
    foil: ScgPriceObj;
}

export interface ScgPriceObj {
    value: string;
    stock: string;
    name: string;
    set: string;
}

export interface TopDeckPriceCache {
    value: number;
}
