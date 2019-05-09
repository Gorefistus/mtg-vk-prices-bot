import AuctionsHelper from '../utils/database/auctions-helper';
import VK from 'vk-io';
import { TopdeckAuction } from 'topdeck-auction';
import axios from 'axios';
import { API_LINKS, DB_CONSTANTS, TIME_CONSTANTS } from '../utils/constants';
import * as moment from "moment";
import { AUCTIONS } from '../utils/strings';


export function TopDeckAuctionWorker(vkApi: VK) {
    setInterval(async () => {
        try {
            const allUsers = await AuctionsHelper.getAllItems();
            const topdeckCurrentAuctionsPricesResponse = await axios.get(API_LINKS.TOPDECK_AUCTIONS, {responseType: 'json'});
            if (topdeckCurrentAuctionsPricesResponse.status < 200 && topdeckCurrentAuctionsPricesResponse.status > 300) {
                console.log('TopdeckWorker network error');
            }
            const topdeckCurrentAuctionsPrices: Array<TopdeckAuction> = topdeckCurrentAuctionsPricesResponse.data.reverse();
            allUsers.forEach(auctionUser => {
                const foundAucsArray: Array<TopdeckAuction> = [];
                const newFoundAucsArray: Array<TopdeckAuction> = [];
                const soonToExpireAucsArray: Array<TopdeckAuction> = [];
                const indexesToDelete: Array<number> = [];
                auctionUser.watchlist.forEach((entry, watchlistIndex) => {
                    topdeckCurrentAuctionsPrices.forEach(auc => {
                        if (auc.lot.toLowerCase().includes(entry.toLowerCase())) {
                            if ((Number.parseInt(auc.date_estimated) - Math.round(Date.now() / 1000)) < DB_CONSTANTS.AUC_EXPIRE_DATE) {
                                const expiredAucIndex = auctionUser.foundAuctions.findIndex((prevFoundAuc) => (prevFoundAuc.id === watchlistIndex && prevFoundAuc.aucId === auc.id
                                ));
                                if (expiredAucIndex > -1) {
                                    soonToExpireAucsArray.push(auc);
                                    indexesToDelete.push(expiredAucIndex);
                                }
                            } else if (!auctionUser.foundAuctions.find((prevFoundAuc) => (
                                prevFoundAuc.id === watchlistIndex && prevFoundAuc.aucId === auc.id
                            ))) {
                                auctionUser.foundAuctions.push({aucId: auc.id, id: watchlistIndex});
                                newFoundAucsArray.push(auc);
                            }
                            foundAucsArray.push(auc);
                        }
                    });
                });
                let notificationString = '';

                if (soonToExpireAucsArray.length > 0) {
                    auctionUser.foundAuctions = auctionUser.foundAuctions.filter((auc, index) => (
                        // @ts-ignore
                        !indexesToDelete.includes(index)
                    ));
                    notificationString = `${AUCTIONS.NEARLY_AUCTIONS_CRITERIA}\n`;
                    soonToExpireAucsArray.forEach(auction => {
                        notificationString = `${notificationString} ${AUCTIONS.LOT} ${auction.lot} | ${AUCTIONS.CURRENT_BID} ${auction.current_bid} | ${API_LINKS.TOPDECK_AUCTIONS_SITE}${auction.id} \n`;
                    });
                }
                if (newFoundAucsArray.length > 0) {
                    notificationString = `${notificationString} ${AUCTIONS.NEW_AUCTIONS_MATCH_CRITERIA}\n`;
                    newFoundAucsArray.forEach((auction => {
                        notificationString = `${notificationString}  ${AUCTIONS.LOT}: ${auction.lot} |  ${AUCTIONS.CURRENT_BID} ${auction.current_bid} | ${AUCTIONS.DATE_ESTIMATED}  ${moment.unix(Number.parseInt(auction.date_estimated, 10)).format(TIME_CONSTANTS.AUCTIONS)} | ${API_LINKS.TOPDECK_AUCTIONS_SITE}${auction.id}`;
                    }));
                }

                if (newFoundAucsArray.length > 0 || soonToExpireAucsArray.length > 0) {
                    try {
                        vkApi.api.messages.send({user_id: auctionUser.userId, message: notificationString});

                    } catch (e) {
                        //probably some VK privacy problems
                        console.log('VK PRIVACY PROBLEMS');
                    }
                    AuctionsHelper.updateItem({userId: auctionUser.userId}, {
                        $set: {
                            cacheDate: Date.now(),
                            foundAuctions: auctionUser.foundAuctions
                        }
                    });
                }


            });

        } catch (e) {
            console.log(e);
            // do nothing
        }
    }, DB_CONSTANTS.AUC_REFRESH_RATE);
}
