const {Bot} = require('node-vk-bot');
const Scry = require("scryfall-sdk");
const path = require("path");
const fs = require('fs');
const express = require('express');


const CONSTANTS = require('./common/constants');
const STRINGS = require('./common/strings');
const MISC = require('./common/misc');

//THIS IS JUST NEEDED SO HEROKU WON"T STOPP OUR APPLICATION
const app = express();
app.use(express.static(path.resolve(__dirname, 'static')));
app.listen(process.env.PORT || 5000);
//__________________________________________________________

const bot = new Bot({
    token: '4f6f50981783386f4c62efc6ea0cc2a8f98a8b73be97ceabd7b445cb51592d8fad1ade764e65444c1a046',
    prefix: /^!mth[\s,]|^!m[\s,]/i,
    prefixOnlyInChats: true,
    api: {
        v: 5.38, // must be >= 5.38
        lang: 'ru'
    }
});


bot.start(3000); //we meed this delay or VK return and error
console.log('____________________________________\n|             Bot started           |\n____________________________________');

bot.get(/[m|h][\s]card[\s,]|c[\s,]/i, message => {
    let cardName = message.body.match(/([m|h][\s]card[\s,]|[m|h][\s]c[\s,])(.*)/i)[2];
    const setNameRegex = message.body.match(/([m|h][\s]card[\s,]|[m|h][\s]c[\s,])(.*)\[(.{3,4})\]/i);
    const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
    if (setCode) {
        cardName = setNameRegex[2];
    }
    MISC.getMultiverseId(cardName.trim(), setCode).then(value => {
        MISC.downloadCardImage(value.image_uris.normal, (filename) => {
            const absolutePath = path.resolve(filename);
            bot.uploadPhoto(absolutePath).then(photo => {
                fs.unlink(filename, () => {
                    console.log(STRINGS.FILE_DELETED);
                });
                const options = {attachment: `photo${photo.owner_id}_${photo.id}`};
                bot.send('', message.peer_id, options);
            }, reason => {
                bot.send(value.image_uris.normal, message.peer_id);
                console.error(`Couldn't uplaod an image`);
                console.log(reason);
                fs.unlink(filename, () => {
                    console.log(STRINGS.FILE_DELETED);
                });
            });
        });
    }, reason => {
        if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
            return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
        }
        const options = {forward_messages: message.id};
        bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
    });
});

bot.get(/([m|h][\s]oracle[\s,]|[m|h][\s]o[\s,])/i, message => {
    const cardName = message.body.match(/([m|h][\s]oracle[\s,]|[m|h][\s]o[\s,])(.*)/i)[2];
    MISC.getMultiverseId(cardName).then(value => {
        let oracleText = '';
        if (value.card_faces && value.card_faces.length > 0) {
            value.card_faces.forEach((face) => {
                oracleText = oracleText + '\n\n' + face.oracle_text;
            })
        } else {
            oracleText = value.oracle_text;
        }
        bot.send(`${value.name} oracle text :\n ${oracleText}`, message.peer_id);
    }, reason => {
        if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
            return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
        }
        const options = {forward_messages: message.id};
        bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
    });
});

bot.get(/([m|h][\s]price[\s,]|[m|h][\s]p[\s,])/i, message => {
    const cardName = message.body.match(/([m|h][\s]price[\s,]|[m|h][\s]p[\s,])(.*)/i)[2];
    MISC.getMultiverseId(cardName).then(value => {
        bot.send(`${value.name} prices :\n TCG Mid: ${value.usd ? value.usd + '$' : STRINGS.NO_DATA} \n MTGO: ${value.tix ? value.tix + '$' : STRINGS.NO_DATA}`, message.peer_id);
    }, reason => {
        console.log(reason);
        if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
            return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
        }
        const options = {forward_messages: message.id};
        bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
    });
});

bot.get(/([m|h][\s]helpme[\s,]|[m|h][\s]hm[\s,])/i, message => {
    const cardName = message.body.match(/([m|h][\s]helpme[\s,]|[m|h][\s]hm[\s,])(.*)/i)[2];
    if (cardName.length < 2) {
        return bot.send(STRINGS.NAME_SHORT_ERR, message.peer_id)
    }
    Scry.Cards.autoCompleteName(cardName).then(results => {
        if (results.length > 0) {
            let suggestions = 'Did you mean:';
            for (let i = 0; i < 5 && i < results.length - 1; i++) {
                suggestions = suggestions + '\n ' + results[i]
            }
            bot.send(suggestions, message.peer_id);
        } else {
            bot.send(STRINGS.SUGGESTIONS_NOT_FOUND, message.peer_id);

        }
    }, reason => {
        if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
            return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
        }
        bot.send(STRINGS.SUGGESTIONS_NOT_FOUND, message.peer_id);
    })
});

bot.get(/([m|h][\s]legality[\s]|[m|h][\s]l[\s])/i, message => {
    const cardName = message.body.match(/([m|h][\s]legality[\s]|[m|h][\s]l[\s])(.*)/i)[2];
    MISC.getMultiverseId(cardName).then(value => {
        bot.send(`${value.name} legality:\n 
        ${STRINGS.FORMAT_STANDARD}: ${MISC.getLegality(value.legalities.standard)}
        ${STRINGS.FORMAT_MODERN}: ${MISC.getLegality(value.legalities.modern)}
        ${STRINGS.FORMAT_LEGACY}: ${MISC.getLegality(value.legalities.legacy)}
        ${STRINGS.FORMAT_PAUPER}: ${MISC.getLegality(value.legalities.pauper)}
        ${STRINGS.FORMAT_COMMANDER}: ${MISC.getLegality(value.legalities.commander)}
        ${STRINGS.FORMAT_VINTAGE}: ${MISC.getLegality(value.legalities.vintage)}`, message.peer_id)
    }, reason => {
        if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
            return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
        }
        const options = {forward_messages: message.id};
        bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
    })
});

bot.get(/help\b|h\b/i, message => {
    const options = {forward_messages: message.id};
    bot.send('Available commands:\n ' +
        '!MTH card (c) %cardname% [%set_abbreviation%]  -  to show the image of the card from desired set if provided, supports both russian and english names  \n\n ' +
        '!MTH price (p) %cardname% -  to show TCG mid and MTGO prices, supports both russian and english names    \n\n ' +
        '!MTH oracle (o)  %cardname% - to show oracle text for the card and its gatherer rulings, supports both russian and english names   \n\n ' +
        '!MTH HelpMe (hm) %cardname% - remember forgotten card name, supports only english names\n\n' +
        '!MTH legality (l) %cardname%  - check legality for the card in most popular formats, supports both russian and english names  ', message.peer_id, options);
});

bot.on('poll-error', error => {
    console.log(error);
});

bot.on('command-notfound', msg => {
    bot.send(STRINGS.COMMAND_NOT_FOUND, msg.peer_id)
});

