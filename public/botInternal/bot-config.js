const stats = require('bot-metrica')(process.env.YA_TOKEN || 'place your ya metrika token here');

const STRINGS = require('../common/strings');
const cardCommand = require('./commands/card');
const artCommand = require('./commands/art');
const helpmeCommand = require('./commands/help-me');
const legalityCommand = require('./commands/legality');
const helpCommand = require('./commands/help');
const miscCommand = require('./commands/misc');
const oracleCommand = require('./commands/oracle');
const priceCommand = require('./commands/price');
const priceFoilCommand = require('./commands/priceFoil');
const printingsCommand = require('./commands/printings');
const advancedSearchCommand = require('./commands/advanced-search');
const announcmentCommand = require('./commands/announcment');
const printingLanguagesCommand = require('./commands/printing-languages');
const wikiCommand = require('./commands/wiki');

function addCommands(bot) {
    console.log('Commands addition started');

    _addTypingStatusCommand(bot);

    announcmentCommand(bot, stats);
    cardCommand(bot, stats);
    artCommand(bot, stats);
    helpmeCommand(bot, stats);
    legalityCommand(bot, stats);
    oracleCommand(bot, stats);
    priceCommand(bot, stats);
    priceFoilCommand(bot, stats);
    printingsCommand(bot, stats);
    advancedSearchCommand(bot, stats);
    printingLanguagesCommand(bot, stats);
    wikiCommand(bot, stats);
    helpCommand(bot, stats);
    miscCommand(bot, stats);

    console.log('Commands addition finished');
}


function _addTypingStatusCommand(bot) {
    if (bot && !bot.sendTyping) {
        bot.sendTyping = async (message) => {
            const { peer_id } = message;
            await bot.api('messages.setActivity', {
                //bot VKId
                user_id: 488906794,
                peer_id,
                type: 'typing',
            });
        };
    }
}


function startBot(bot, pollDelay = 3000) {
    if (bot && typeof bot.start === 'function') {
        addCommands(bot);
        bot.start(pollDelay); // we meed this delay or VK return and error
        console.log('____________________________________\n|             Bot started           |\n____________________________________');
    } else {
        console.error(STRINGS.BOT_ERROR);
    }
}


module.exports = {
    startBot,
};
