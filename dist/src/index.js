"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vk_io_1 = __importDefault(require("vk-io"));
const node_vk_bot_1 = require("node-vk-bot");
const card_1 = __importDefault(require("./bot-commands/card"));
const creds_json_1 = __importDefault(require("../creds.json"));
const util = __importStar(require("util"));
// const VkBot = require('node-vk-bot-api');
// const path = require('path');
// const express = require('express');
// const http = require('http');
const vkApi = new vk_io_1.default({
    token: process.env.VK_TOKEN || creds_json_1.default.vkToken || 'place your token here',
    pollingGroupId: Number.parseInt(process.env.VK_ID, 10) || creds_json_1.default.groupId || undefined,
});
const bot = new node_vk_bot_1.Bot({
    token: process.env.VK_TOKEN || creds_json_1.default.vkToken || 'place your token here',
    group_id: Number.parseInt(process.env.VK_ID, 10) || creds_json_1.default.groupId || undefined,
    api: {
        v: '5.92',
        lang: 'ru',
    },
});
const checkRegex = (msg, exec, reply, commands) => {
    for (const command of commands) {
        console.log(command.checkRegex(msg.text));
        if (command.checkRegex(msg.text)) {
            command.processCommand(msg, exec, reply);
            break;
        }
    }
};
const startBot = (bot, vkApi) => {
    const commandArray = [new card_1.default(bot, vkApi)];
    bot.on('command-notfound', msg => {
        console.log(msg);
        // bot.send('What?', msg.peer_id)
    });
    bot.on('poll-error', error => {
        console.error('error occurred on a working with the Long Poll server ' +
            `(${util.inspect(error)})`);
    });
    bot.get(/.*/i, ((msg, exec, reply) => {
        console.log(msg, 2);
        // reply('wow');
    }));
    bot.start();
    console.log('Bot Has Started');
};
startBot(bot, vkApi);
//# sourceMappingURL=index.js.map