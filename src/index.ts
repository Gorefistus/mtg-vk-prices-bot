import VK from 'vk-io';
import { Bot, replyFunc } from 'node-vk-bot';
import CardCommand from './bot-commands/card';
import creds from '../creds.json';
import Message from 'node-vk-bot/build/interfaces/Message';
import * as util from 'util';

// const VkBot = require('node-vk-bot-api');
// const path = require('path');
// const express = require('express');
// const http = require('http');


const vkApi = new VK({
    token: process.env.VK_TOKEN || creds.vkToken || 'place your token here',
    pollingGroupId: Number.parseInt(process.env.VK_ID, 10) || creds.groupId || undefined,

});

const bot = new Bot({
    token: process.env.VK_TOKEN || creds.vkToken || 'place your token here',
    group_id: Number.parseInt(process.env.VK_ID, 10) || creds.groupId || undefined,
    api: {
        v: '5.92',
        lang: 'ru',
    },
});


const checkRegex = (msg: Message, exec: RegExpExecArray, reply: replyFunc, commands: Array<CardCommand>) => {
    for (const command of commands) {
        console.log(command.checkRegex(msg.text));
        if (command.checkRegex(msg.text)) {
            command.processCommand(msg, exec, reply);
            break;
        }
    }
};


const startBot = (bot: Bot, vkApi: VK) => {

    const commandArray: Array<CardCommand> = [new CardCommand(bot, vkApi)];

    bot.on('command-notfound', msg => {
        console.log(msg);
        // bot.send('What?', msg.peer_id)
    });


    bot.on('poll-error', error => {
        console.error('error occurred on a working with the Long Poll server ' +
            `(${util.inspect(error)})`);
    });

    bot.get(/.*/i, ((msg: Message, exec: RegExpExecArray, reply: replyFunc) => {
        console.log(msg, 2);
        // reply('wow');
    }));

    bot.start();

    console.log('Bot Has Started');
};

startBot(bot, vkApi);
