import { TopdeckSeller } from 'topdeck-auction';

export interface TopDeckPrice {
    city: string;
    cost: number;
    line?: string;
    name: string;
    qty: number;
    seller: string | TopdeckSeller;
    source?: string;
    stamp: string;
    url: string;
}
