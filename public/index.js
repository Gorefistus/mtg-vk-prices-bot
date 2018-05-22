const {Bot} = require('node-vk-bot');
const Scry = require("scryfall-sdk");
const path = require("path");
const fs = require('fs'),
    request = require('request');

const download = function (uri, callback) {
    request.head(uri, function (err, res, body) {
        const fileName = Date.now().toString()+'.jpg';
        request(uri).pipe(fs.createWriteStream(fileName)).on('close',()=> callback(fileName));
    });
};

const bot = new Bot({
    token: '0f2e7ea74bdf1669160665da6e5135126da09bb93878338a4f343db0b435d1fc0bf379cb19b2f803c5028',
    prefix: /^!MTH[\s,]/,
    prefixOnlyInChats: true,
    api: {
        v: 5.38, // must be >= 5.38
        lang: 'ru'
    }
});

bot.start(3000); //we meed this delay or VK return and error
console.log('____________________________________\n|             Bot started           |\n____________________________________');

bot.get(/help|HELP/, message => {
    const options = {forward_messages: message.id};
    bot.send('Available commands:\n ' +
        '!MTH card %cardname%  -  to show the image of the card from desired set if provided  \n ' +
        '!MTH price %cardname% -  to show TCG mid and MTGO prices  \n ' +
        '!MTH oracle %cardname% - to show oracle text for the card and its gatherer rulings', message.peer_id, options);
});


bot.get(/card|Card/, message => {
    const options = {attachment: 'photo'};
    const cardName = message.body.match(/(card|Card)(.*)/)[2];
    Scry.Cards.byName(cardName, true).then(value => {
        download(value.image_uris.normal, (filename) => {
            const absolutePath = path.resolve(filename);
            bot.uploadPhoto(absolutePath).then(photo => {
                fs.unlink(filename, () => {
                    'File deleted'
                });
                const options = {attachment:`photo${photo.owner_id}_${photo.id}`};
                bot.send('', message.peer_id, options);
            }, reason => {
                bot.send(value.image_uris.normal, message.peer_id);
                console.error(`Couldn't uplaod an image`);
                console.log(reason);
                fs.unlink(filename, () => {
                    'File deleted'
                });
            });
        });
    }, reason => {
        const options = {forward_messages: message.id};
        bot.send('Card not found!', message.peer_id, options);
    });
});

bot.get(/(oracle|Oracle)/, message => {
    const cardName = message.body.match(/(oracle|Oracle)(.*)/)[2];
    Scry.Cards.byName(cardName, true).then(value => {
        bot.send(`${value.name} oracle text :\n ${value.oracle_text}`, message.peer_id);
    }, reason => {
        const options = {forward_messages: message.id};
        bot.send('Card not found!', message.peer_id, options);
    });
});


bot.get(/(price|Price)/, message => {
    const cardName = message.body.match(/(price|Price)(.*)/)[2];
    Scry.Cards.byName(cardName, true).then(value => {
        bot.send(`${value.name} prices :\n TCG Mid: ${value.usd} $ \n MTGO: ${value.tix} tix`, message.peer_id);
    }, reason => {
        const options = {forward_messages: message.id};
        bot.send('Card not found!', message.peer_id, options);
    });
});


bot.on('poll-error', error => {
    console.log(error);
    bot.stop();
    console.error('Bot Stopped');
});

bot.on('command-notfound', msg => {
    bot.send('Command not found, try !MTH help for the list of commands', msg.peer_id)
});

