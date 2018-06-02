const STRINGS = require('../common/strings');
const CONSTANTS = require('../common/constants');
const cardCommand = require('./commands/card');
const helpmeCommand = require('./commands/helpme');
const legalityCommand = require('./commands/legality');
const helpCommand = require('./commands/help');
const miscCommand = require('./commands/misc');
const oracleCommand = require('./commands/oracle');
const priceCommand = require('./commands/price');
const printingsCommand = require('./commands/printings');

function addCommands(bot) {
    console.log('Adding commands started');

    cardCommand.addCardCommand(bot);
    helpmeCommand.addHelpmeCommand(bot);
    legalityCommand.addLegalityCommand(bot);
    oracleCommand.addOracleCommand(bot);
    priceCommand.addPriceCommand(bot);
    printingsCommand.addPrintingsCommand(bot);
    miscCommand.addMiscCommands(bot);
    helpCommand.addHelpCommand(bot);

    console.log('Adding commands finished');
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
