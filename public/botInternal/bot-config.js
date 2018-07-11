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
const printingsCommand = require('./commands/printings');
const advancedSearchCommand = require('./commands/advanced-search');
const announcmentCommand = require('./commands/announcment');
const printingLanguagesCommand = require('./commands/printing-languages');
const wikiCommand = require('./commands/wiki');

function addCommands(bot) {
    console.log('Commands addition started');

    announcmentCommand.addAnouncmentCommand(bot, stats);
    cardCommand.addCardCommand(bot, stats);
    artCommand.addArtCommand(bot, stats);
    helpmeCommand.addHelpmeCommand(bot, stats);
    legalityCommand.addLegalityCommand(bot, stats);
    oracleCommand.addOracleCommand(bot, stats);
    priceCommand.addPriceCommand(bot, stats);
    printingsCommand.addPrintingsCommand(bot, stats);
    advancedSearchCommand.addAdvancedSearchCommand(bot, stats);
    printingLanguagesCommand.addPrintingLanguagesCommand(bot, stats)
    wikiCommand.addWikiCommand(bot, stats);
    helpCommand.addHelpCommand(bot, stats);
    miscCommand.addMiscCommands(bot, stats);

    console.log('Commands addition finished');
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
