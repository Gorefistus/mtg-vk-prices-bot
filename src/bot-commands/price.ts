import VK, { MessageContext } from 'vk-io';
import { Card } from 'scryfall-sdk';
import axios from 'axios';
import request from 'request-promise-native';

import BasicCommand from './basic-command';
import { API_LINKS, PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { getCardByName } from '../utils/scryfall-utils';
import { ERRORS, GENERAL, LOGS } from '../utils/strings';
import PriceHelper from '../utils/database/price-helper';
import ImageHelper from '../utils/database/image-helper';
import { getStartCityPrices } from '../utils/scg-utils';
import { TopDeckPrice } from 'topdeck-price';
import { SCGPrice, TopDeckPriceCache } from 'price-cache';
import { ImageCache } from 'image-cache';
import { getGoldfishPriceGraph } from '../utils/goldfish-utils';
import { getRecommendation } from '../utils/recommendation';


export default class PriceCommand extends BasicCommand {
    fullName: string; // price
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string;  // p
    vkBotApi: VK;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.fullName = 'price';
        this.shortName = 'p';
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
            let priceImageFromCache;
            if (priceFromCache) {
                priceImageFromCache = await ImageHelper.getItem({cardId: foundCard.illustration_id, trade: true});
                if (!priceImageFromCache) {
                    priceImageFromCache = await getGoldfishPriceGraph(this.vkBotApi, foundCardName, foundCard);
                }

                this.sendPriceMessage(foundCard, msg, cardName, priceFromCache.scgPrice, priceFromCache.topdeckPrice, priceImageFromCache);
            } else {
                const rawPriceObject = <{ scg: SCGPrice, topdeck: TopDeckPriceCache }>{};
                const image =  await getGoldfishPriceGraph(this.vkBotApi, foundCardName, foundCard);

                //// SCG PRICES SCRAPING START
                try {
                    const starCityPage = await axios.get(`${API_LINKS.STAR_CITY_PRICE}${encodeURIComponent(foundCardName)}`, {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'}});
                    const scgPrice = await getStartCityPrices(starCityPage.data.toString(), foundCard);
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
                        if (rawPriceObject.scg) {
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
                this.sendPriceMessage(foundCard, msg, cardName, rawPriceObject.scg, rawPriceObject.topdeck, image);
            }
        } catch (e) {
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND);
            }
            console.log(e);
            return this.processError(msg);
        }
    }


    sendPriceMessage(card: Card, msg: MessageContext, cardName: string, scgPrice?: SCGPrice, topDeckPriceCache?: TopDeckPriceCache, image?: ImageCache) {
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

        const attachment = image ? `photo${image.photoObject.ownerId}_${image.photoObject.id}` : undefined;

        const keyboard = cardName ? getRecommendation(cardName, this.shortName, PEER_TYPES.GROUP !== msg.peerType) : undefined;

        if (keyboard) {
            msg.send(priceString, {attachment, keyboard: keyboard});
        } else {
            msg.send(priceString, {attachment});
        }
    }

}
