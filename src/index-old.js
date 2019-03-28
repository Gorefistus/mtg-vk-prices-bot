const { Bot } = require('node-vk-bot');
const VkBot = require('node-vk-bot-api');
const { VK } = require('vk-io');
const path = require('path');
const express = require('express');
const http = require('http');
const creds = require('../creds.json');

const botStarter = require('./botInternal/bot-config');
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


// __________________________________________________________
// const bot = new Bot({
//     token: process.env.VK_TOKEN || creds.vkToken || 'place your token here',
//     group_id: Number.parseInt(process.env.VK_ID, 10) || creds.groupId || 'place your group id here',
//     api: {
//         v: '5.80',
//         lang: 'ru',
//     },
// });
//
//
//
// const vkApi = new VK({
//     token: process.env.VK_TOKEN || creds.vkToken || 'place your token here',
//     pollingGroupId: Number.parseInt(process.env.VK_ID, 10) || creds.groupId || 'place your group id here',
//
// });
//
// const bot = new VkBot({
//     token: process.env.VK_TOKEN || creds.vkToken || 'place your token here',
//     group_id: Number.parseInt(process.env.VK_ID, 10) || creds.groupId || 'place your group id here',
// });
//
// botStarter.startBot(bot, vkApi);
