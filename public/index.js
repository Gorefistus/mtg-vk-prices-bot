const { Bot } = require('node-vk-bot');
const path = require('path');
const express = require('express');
const http = require("http");

const botStarter = require('./botInternal/bot-config');
// THIS IS JUST NEEDED SO HEROKU WON"T STOPP OUR APPLICATION
const app = express();
app.use(express.static(path.resolve(__dirname, 'static')));
app.listen(process.env.PORT || 5000);

// __________________________________________________________
const bot = new Bot({
    token: process.env.VK_TOKEN || 'place your group token here',
    group_id: process.env.VK_GROUP || 'place your group id here',
    api: {
        v: 5.81, // must be >= 5.80
        lang: 'ru',
    },
});

botStarter.startBot(bot);
