const { Bot } = require('node-vk-bot');
const path = require('path');
const express = require('express');

const botStarter = require('./botInternal/botConfig');
// THIS IS JUST NEEDED SO HEROKU WON"T STOPP OUR APPLICATION
const app = express();
app.use(express.static(path.resolve(__dirname, 'static')));
app.listen(process.env.PORT || 5000);
// __________________________________________________________

const bot = new Bot({
    token: process.env.VK_TOKEN || '375127c110454c893cc8ad047ae52950d1c98488048db18e156fa013799bcf8bd2fbf4af02a5bbf2a71f2',
    prefix: /^!nth[\s,]|^!n[\s]/i,
    prefixOnlyInChats: true,
    api: {
        v: 5.38, // must be >= 5.38
        lang: 'ru',
    },
});

botStarter.startBot(bot);
