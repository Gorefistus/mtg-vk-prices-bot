import VK, { MessageContext } from 'vk-io';
import { Card } from 'scryfall-sdk';
import axios from 'axios';
import request from 'request-promise-native';

import BasicCommand from './basic-command';
import { API_LINKS, PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { getCardByName } from '../utils/scryfall-utils';
import { ERRORS, ERRORS_EN, GENERAL, GENERAL_EN, LOGS } from '../utils/strings';
import PriceHelper from '../utils/database/price-helper';
import { getStartCityPrices } from '../utils/scg-utils';
import { TopDeckPrice } from 'topdeck-price';
import { SCGPrice, TopDeckPriceCache } from 'price-cache';
import { getRecommendation } from '../utils/recommendation';
import BootBot, { FBMessagePayload } from 'bootbot';


export default class PriceCommand extends BasicCommand {

    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
        this.fullName = 'price';
        this.shortName = 'p';
        this.fbApi = fbApi;
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = new RegExp(`^(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX}?)(${this.shortName}|${this.fullName}) (.*)?`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})(${this.shortName}|${this.fullName}) (.*)?`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    async processCommand(msg: MessageContext) {

        /**
         *
         * Administration managing should be here
         *
         */


        const commandString = msg.messagePayload ? msg.messagePayload.command : msg.text;


        const cardName = commandString.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        const cardSetSplit = cardName.match(/(.*)\[(.{3,4})\]/i);
        let foundCard: Card = undefined;
        try {
            if (cardSetSplit !== null) {
                foundCard = await getCardByName(cardSetSplit[1], cardSetSplit[2]);
            } else {
                foundCard = await getCardByName(cardName);
            }
            let foundCardName = foundCard.name;
            if (foundCard.card_faces) {
                // we only need first half of the name if card is a split card, so we split
                foundCardName = foundCard.name.split('//')[0].trim();
            }
            const priceFromCache = await PriceHelper.getItem({cardId: foundCard.id});
            if (priceFromCache) {
                this.sendPriceMessage(foundCard, msg, cardName, priceFromCache.scgPrice, priceFromCache.topdeckPrice);
            } else {
                const rawPriceObject = <{ scg: SCGPrice, topdeck: TopDeckPriceCache }>{};
                //// SCG PRICES SCRAPING START
                try {
                    const starCityPage = await axios.get(`${API_LINKS.STAR_CITY_PRICE}${encodeURIComponent(foundCardName)}&mpp=48`, {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'}});
                    const scgPrice = await getStartCityPrices(starCityPage.data.toString(), foundCard);
                    console.log(scgPrice);
                    rawPriceObject.scg = scgPrice;
                } catch (e) {
                    console.error(LOGS.STARCITY_PRICE_REQUEST_ERROR, e);
                }

                //// TOPDECK PRICES SCRAPING START
                try {
                    // request lib instead of axios because axios doesn't support CORS bypassing
                    // @ts-ignore
                    const topDeckPrices = <Array<TopDeckPrice>>(await request({
                        method: 'GET',
                        uri: `${API_LINKS.TOPDECK_PRICE}${encodeURIComponent(foundCardName)}`,
                        // @ts-ignore
                        ecdhCurve: 'auto',
                        json: true,
                    }));
                    const filterByNameAndPrice = topDeckPrices.filter(price => {
                        if (rawPriceObject.scg?.normal) {
                            const scgPriceInNumber = parseFloat(rawPriceObject.scg.normal.value.split('$')[1]);
                            return price.name.toLowerCase() === foundCardName.toLowerCase() && price.cost > scgPriceInNumber * 25;
                        }
                        return price.name.toLowerCase() === foundCardName.toLowerCase();
                    });
                    if (filterByNameAndPrice.length > 0) {
                        rawPriceObject.topdeck = {value: filterByNameAndPrice[0].cost};
                    } else {
                        const filterByName = topDeckPrices.filter(price => price.name.toLowerCase() === foundCardName.toLowerCase());
                        if (filterByName.length > 0) {
                            rawPriceObject.topdeck = {value: filterByNameAndPrice[0].cost};
                        }
                    }
                } catch (e) {
                    console.error(LOGS.TOPDECK_PRICE_REQUEST_ERROR, e);
                }
                if (rawPriceObject.topdeck && rawPriceObject.scg) {
                    PriceHelper.createItem({
                        cardName: foundCard.name,
                        cardSet: foundCard.set_name,
                        cardId: foundCard.id,
                        scgPrice: rawPriceObject.scg,
                        topdeckPrice: rawPriceObject.topdeck
                    });
                }
                this.sendPriceMessage(foundCard, msg, cardName, rawPriceObject.scg, rawPriceObject.topdeck);
            }
        } catch (e) {
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND);
            }
            console.log(e);
            return this.processError(msg);
        }
    }


    async processCommandFacebook(payload: FBMessagePayload): Promise<any> {
        const commandString = payload?.message?.text || payload?.postback?.payload;

        const cardName = commandString.match(this.regex)[3];
        const cardSetSplit = cardName.match(/(.*)\[(.{3,4})\]/i);
        let foundCard: Card = undefined;
        try {
            if (cardSetSplit !== null) {
                foundCard = await getCardByName(cardSetSplit[1], cardSetSplit[2]);
            } else {
                foundCard = await getCardByName(cardName);
            }
            let foundCardName = foundCard.name;
            if (foundCard.card_faces) {
                // we only need first half of the name if card is a split card, so we split
                foundCardName = foundCard.name.split('//')[0].trim();
            }
            const priceFromCache = await PriceHelper.getItem({cardId: foundCard.id});
            if (priceFromCache) {
                this.sendPriceMessageFacebook(foundCard, payload, cardName, priceFromCache.scgPrice);
            } else {
                const rawPriceObject = <{ scg: SCGPrice, topdeck: TopDeckPriceCache }>{};

                //// SCG PRICES SCRAPING START
                try {
                    const starCityPage = await axios.get(`${API_LINKS.STAR_CITY_PRICE}${encodeURIComponent(foundCardName)}`, {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'}});
                    const scgPrice = await getStartCityPrices(starCityPage.data.toString(), foundCard);
                    rawPriceObject.scg = scgPrice;
                } catch (e) {
                    console.error(LOGS.STARCITY_PRICE_REQUEST_ERROR, e);
                }
                this.sendPriceMessageFacebook(foundCard, payload, cardName, rawPriceObject.scg);
            }
        } catch (e) {
            if (!e) {
                return this.processErrorFacebook(payload, ERRORS_EN.CARD_NOT_FOUND);
            }
            console.log(e);
            return this.processErrorFacebook(payload);
        }
    }

    sendPriceMessage(card: Card, msg: MessageContext, cardName: string, scgPrice?: SCGPrice, topDeckPriceCache?: TopDeckPriceCache) {
        let priceString = `${GENERAL.PRICE_FOR} ${card.printed_name ? card.printed_name : card.name} [${card.set_name}]:\n`;
        // TCG
        priceString = `${priceString} TCG: ${card.prices.usd ? `$${card.prices.usd}` : ERRORS.PRICE_NO_INFO}\n`;
        // TCG FOIL
        priceString = card.prices.usd_foil ? `${priceString} TCG FOIL: $${card.prices.usd_foil} \n` : priceString;
        // MTGO
        priceString = `${priceString} MTGO: ${card.prices.tix ? `${card.prices.tix} tix` : ERRORS.PRICE_NO_INFO}\n`;
        // StarCity
        priceString = `${priceString} ${scgPrice && scgPrice.normal ? `SCG (${GENERAL.STOCK}: ${scgPrice.normal.stock === ERRORS.PRICE_SCG_OUT_OF_STOCK_ENG ? ERRORS.PRICE_SCG_OUT_OF_STOCK_RUS : scgPrice.normal.stock}) :${scgPrice.normal.set !== card.set_name ? ` [${scgPrice.normal.set}]` : ''} ${scgPrice.normal.value}` : `SCG: ${ERRORS.PRICE_NO_INFO}`} \n`;
        // StarCity Foil
        priceString = scgPrice && scgPrice.foil ? `${priceString} SCG FOIL (${GENERAL.STOCK}: ${scgPrice.foil.stock === ERRORS.PRICE_SCG_OUT_OF_STOCK_ENG ? ERRORS.PRICE_SCG_OUT_OF_STOCK_RUS : scgPrice.foil.stock}) :${scgPrice.foil.set !== card.set_name ? ` [${scgPrice.foil.set}]` : ''} ${scgPrice.foil.value} \n` : priceString;
        // TopDeck
        priceString = `${priceString} ${topDeckPriceCache ? `${GENERAL.PRICES_TOPDECK}: ${topDeckPriceCache.value} RUB` : `TopDeck: ${ERRORS.PRICE_NO_INFO}`}\n`;

        const keyboard = cardName ? getRecommendation(cardName, this.shortName, msg.hasMessagePayload) : undefined;

        if (keyboard) {
            msg.send(priceString, { keyboard: keyboard});
        } else {
            msg.send(priceString);
        }
    }

    sendPriceMessageFacebook(card: Card, payload: FBMessagePayload, cardName: string, scgPrice?: SCGPrice) {
        let priceString = `${GENERAL_EN.PRICE_FOR} ${card.printed_name ? card.printed_name : card.name} [${card.set_name}]:\n`;
        // TCG
        priceString = `${priceString} TCG: ${card.prices.usd ? `$${card.prices.usd}` : ERRORS_EN.PRICE_NO_INFO}\n`;
        // TCG FOIL
        priceString = card.prices.usd_foil ? `${priceString} TCG FOIL: $${card.prices.usd_foil} \n` : priceString;
        // MTGO
        priceString = `${priceString} MTGO: ${card.prices.tix ? `${card.prices.tix} tix` : ERRORS_EN.PRICE_NO_INFO}\n`;
        // StarCity
        priceString = `${priceString} ${scgPrice && scgPrice.normal ? `SCG (${GENERAL_EN.STOCK}: ${scgPrice.normal.stock === ERRORS.PRICE_SCG_OUT_OF_STOCK_ENG ? ERRORS.PRICE_SCG_OUT_OF_STOCK_ENG : scgPrice.normal.stock}) :${scgPrice.normal.set !== card.set_name ? ` [${scgPrice.normal.set}]` : ''} ${scgPrice.normal.value}` : `SCG: ${ERRORS_EN.PRICE_NO_INFO}`} \n`;
        // StarCity Foil
        priceString = scgPrice && scgPrice.foil ? `${priceString} SCG FOIL (${GENERAL_EN.STOCK}: ${scgPrice.foil.stock === ERRORS.PRICE_SCG_OUT_OF_STOCK_ENG ? ERRORS.PRICE_SCG_OUT_OF_STOCK_ENG : scgPrice.foil.stock}) :${scgPrice.foil.set !== card.set_name ? ` [${scgPrice.foil.set}]` : ''} ${scgPrice.foil.value} \n` : priceString;

        this.fbApi.say(payload.sender.id, {
            text: priceString, buttons: [{
                type: 'postback',
                title: GENERAL_EN.VIEW_IMAGE,
                payload: `!c ${card.name}[${card.set}]`,
            }, {
                type: 'web_url',
                // @ts-ignore
                url: card.purchase_uris.tcgplayer,
                title: GENERAL_EN.BUY_TCG
            }, {type: 'web_url', url: card.purchase_uris.cardhoarder, title: GENERAL_EN.BUY_CARDHOARDER}],
        });
    }

}
