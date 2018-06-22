const STRINGS = require('../../common/strings');


function addHelpCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/[m|h][\s]help\b|[m|h][\s]h\b/i, (message) => {
            const options = { forward_messages: message.id };
            bot.send('Available commands:\n ' +
                '!MTH card (c) %cardname% [%set_abbreviation%] ; %cardname% [%set_abbreviation%]  -  to show the image of the cards (up to 10 images per message) from desired set if provided, supports both russian and english names  \n\n ' +
                '!MTH price (p) %cardname% [%set_abbreviation%]  -  to show TCG mid, MTGO, TopDeck(not tied to card edition) and StarCityGames prices (or a link to StarCityGames if bot is banned from scraping info), supports both russian and english names    \n\n ' +
                '!MTH oracle (o)  %cardname% - to show oracle text for the card and its gatherer rulings, supports both russian and english names   \n\n ' +
                '!MTH HelpMe (hm) %cardname% - remember forgotten card name, supports only english names\n\n' +
                '!MTH legality (l) %cardname%  - check legality for the card in most popular formats, supports both russian and english names\n\n' +
                '!MTH printings (pr) %cardname% - shows up to 10 printing of the card, supports both russian and english names \n\n' +
                '!MTH AdvancedSearch (as) $searchQuery$ - search with https://scryfall.com/docs/reference syntax FOR ADVANCED USERS, show up to top 10 results', message.peer_id, options);
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addHelpCommand,
};
