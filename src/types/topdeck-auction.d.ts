export interface TopdeckAuction {
    id: string,
    bid_amount: string,
    current_bid: string,
    date_estimated: string,
    date_published: string,
    image_url: string,
    lot: string,
    shipping_info: string,
    shipping_info_quick: string,
    seller: TopdeckSeller
}

export interface TopdeckEndedAuction {
    id: string,
    date_ended: string,
    lot: string,
    seller: TopdeckSeller,
    winner: TopdeckAuctionWinner,
    winning_bid: string
}

export interface TopdeckSeller {
    id: string,
    city: string,
    name: string,
    refs: string,
}


export interface TopdeckAuctionWinner {
    id: string,
    city: string,
    name: string,
    refs: string,
}
