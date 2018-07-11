const { Bot } = require('node-vk-bot');
const path = require('path');
const express = require('express');
const http = require("http");

const botStarter = require('./botInternal/bot-config');
// THIS IS JUST NEEDED SO HEROKU WON"T STOPP OUR APPLICATION
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
const bot = new Bot({
    token: process.env.VK_TOKEN || 'place your token here',
    prefix: /^!mth[\s,]|^!m[\s]/i,
    prefixOnlyInChats: true,
    api: {
        v: 5.38, // must be >= 5.38
        lang: 'ru',
    },
});

botStarter.startBot(bot);
