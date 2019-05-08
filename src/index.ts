import VK, { MessageContext } from 'vk-io';

import CardCommand from './bot-commands/card';
import NotFoundCommand from './bot-commands/not-found';
import creds from '../creds.json';
import { PEER_TYPES } from './utils/constants';
import AdministrationCommand from './bot-commands/administration';
import AuctionsCommand from './bot-commands/auctions';
import PriceCommand from './bot-commands/price';
import ArtCommand from './bot-commands/art';
import LegalityCommand from './bot-commands/legality';
import OracleCommand from './bot-commands/oracle';
import AdvancedSearchCommand from './bot-commands/advanced-search';
import PrintingsCommand from './bot-commands/printings';
import WikiCommand from './bot-commands/wiki';
import PrintingLanguagesCommand from "./bot-commands/printing-languages";
import WatchAuctionsCommand from "./bot-commands/watch-auctions";
import { TopDeckAuctionWorker } from './workers/topdeck-auction-worker';

// const VkBot = require('node-vk-bot-api');
// const path = require('path');
// const express = require('express');
// const http = require('http');


const vkApi = new VK({
    token: process.env.VK_TOKEN || creds.vkToken || 'place your token here',
    pollingGroupId: Number.parseInt(process.env.VK_ID, 10) || creds.groupId || undefined, // place your group ID here

});


const checkRegex = (msg: MessageContext, commands: Array<CardCommand>) => {
    for (const command of commands) {
        if (command.checkRegex(msg.text, PEER_TYPES.GROUP === msg.peerType)) {
            command.processCommand(msg);
            break;
        }
    }
};


const startBot = (vkBotApi: VK) => {

    const commandArray: Array<CardCommand> = [
        new ArtCommand(vkBotApi),
        new AdministrationCommand(vkBotApi),
        new AdvancedSearchCommand(vkBotApi),
        new AuctionsCommand(vkBotApi),
        new CardCommand(vkBotApi),
        new PrintingLanguagesCommand(vkBotApi),
        new PrintingsCommand(vkBotApi),
        new PriceCommand(vkBotApi),
        new OracleCommand(vkBotApi),
        new LegalityCommand(vkBotApi),
        new WatchAuctionsCommand(vkBotApi),
        new WikiCommand(vkBotApi),
        new NotFoundCommand(vkBotApi), // this command should always trigger last
    ];

    vkBotApi.updates.on('join_group_member', context => {
        // console.log(context);
    });


    vkBotApi.updates.hear(/.*/i, async (context: MessageContext) => {
        checkRegex(context, commandArray);
    });

    vkBotApi.updates.startPolling().catch(reason => console.log(reason));

    launchWorkers(vkBotApi);

    console.log('Bot Has Started');
};

function launchWorkers(vkApi: VK) {
    TopDeckAuctionWorker(vkApi);
}

startBot(vkApi);
