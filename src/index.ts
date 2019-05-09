import VK, { MessageContext } from 'vk-io';
import express from 'express';
import * as path from 'path';
import http from 'http';

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
import PrintingLanguagesCommand from './bot-commands/printing-languages';
import WatchAuctionsCommand from './bot-commands/watch-auctions';
import { TopDeckAuctionWorker } from './workers/topdeck-auction-worker';
// @ts-ignore
import stats from 'bot-metrica';
import HelpCommand from './bot-commands/help';

// THIS IS JUST NEEDED SO HEROKU WON"T STOP OUR APPLICATION
const app = express();
app.use(express.static(path.resolve(__dirname + '/static')));
app.listen(process.env.PORT || 5000);

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

setInterval(() => {
    console.log('PINGED YOURSELF');
    http.get('http://mtgvkbotprices.herokuapp.com/');
}, 300000);


const vkApi = new VK({
    // @ts-ignore
    token: process.env.VK_TOKEN || creds.vkToken || 'place your token here',
    // @ts-ignore
    pollingGroupId: Number.parseInt(process.env.VK_ID, 10) || creds.groupId || undefined, // place your group ID here
    apiTimeout: 30000,
    uploadTimeout: 50000,

});


const checkRegex = (msg: MessageContext, commands: Array<CardCommand>, yaStats: any): void => {
    if (msg.senderId < 0) {
        // do not check message from groups (including yourself)
        return;
    }
    for (const command of commands) {
        const commandString = msg.messagePayload ? msg.messagePayload.command : msg.text;
        if (command.checkRegex(commandString, PEER_TYPES.GROUP === msg.peerType)) {
            if (command.shortName !== 'BC') {
                msg.setActivity();
                yaStats.track(msg.senderId, {msg: commandString}, command.shortName);
                command.processCommand(msg);
            }
            break;
        }
    }
};


const startBot = (vkBotApi: VK) => {

    // @ts-ignore
    const yaStats = stats(process.env.YA_TOKEN || creds.yandexToken || 'place your ya metrika token here');

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
        new HelpCommand(vkBotApi),
        new NotFoundCommand(vkBotApi), // this command should always trigger last
    ];

    vkBotApi.updates.hear(/.*/i, async (context: MessageContext) => {
        checkRegex(context, commandArray, yaStats);
    });

    vkBotApi.updates.startPolling().catch(reason => console.log(reason));

    launchWorkers(vkBotApi);

    console.log('Bot Has Started');
};

function launchWorkers(vkApi: VK) {
    TopDeckAuctionWorker(vkApi);
}

startBot(vkApi);
