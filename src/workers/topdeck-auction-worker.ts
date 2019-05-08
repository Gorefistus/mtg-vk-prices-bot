import AuctionsHelper from '../utils/database/auctions-helper';
import VK from 'vk-io';
import { TopdeckAuction } from 'topdeck-auction';
import axios from 'axios';
import { API_LINKS } from '../utils/constants';

export function TopDeckAuctionWorker(vkApi: VK) {
    setInterval(async () => {
        try {
            const allUsers = await AuctionsHelper.getAllItems();
            const topdeckCurrentAuctionsPricesResponse = await axios.get(API_LINKS.TOPDECK_AUCTIONS, {responseType: 'json'});
            if (topdeckCurrentAuctionsPricesResponse.status < 200 && topdeckCurrentAuctionsPricesResponse.status > 300) {
                console.log('OOPS SOMETHING WRONG');
            }
            const topdeckCurrentAuctionsPrices: Array<TopdeckAuction> = topdeckCurrentAuctionsPricesResponse.data.reverse();
            allUsers.forEach(auctionUser => {
                const foundAucsArray: Array<TopdeckAuction> = [];
                const newFoundAucsArray: Array<TopdeckAuction> = [];
                auctionUser.watchlist.forEach((entry) => {
                    topdeckCurrentAuctionsPrices.forEach(auc => {
                        if (auc.lot.toLowerCase().includes(entry.toLowerCase())) {
                            // @ts-ignore
                            if (!auctionUser.foundAuctions.includes(auc.id)) {
                                auctionUser.foundAuctions.push(auc.id);
                                newFoundAucsArray.push(auc);
                            }
                            foundAucsArray.push(auc);
                        }
                    });
                });
                if (newFoundAucsArray.length > 0) {
                    console.log('Стало больше ауков');
                    AuctionsHelper.updateItem({userId: auctionUser.userId}, {
                        $set: {
                            cacheDate: Date.now(),
                            foundAuctions: auctionUser.foundAuctions
                        }
                    });
                    vkApi.api.messages.send({user_id: auctionUser.userId, message: 'Вау ауки'});
                }
            });

        } catch (e) {
            console.log(e);
            // do nothing
        }
    }, 1000 * 7);
}
