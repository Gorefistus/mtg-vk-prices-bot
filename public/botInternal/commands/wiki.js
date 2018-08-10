const wiki = require('wikijs').default;

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');


function addWikiCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]wiki[\s]|[m|h][\s]w[\s])/i, (message) => {
            stats.track(message.user_id, { msg: message.body }, 'w');
            const searchQuery = message.body.match(/([m|h][\s]wiki[\s,]|[m|h][\s]w[\s])(.*)/i)[2];
            wiki({
                apiUrl: CONSTANTS.WIKI_LINK,
                origin: null,
            })
                .search(searchQuery)
                .then((res) => {
                    if (res && res.results.length > 0) {
                        return wiki({
                            apiUrl: CONSTANTS.WIKI_LINK,
                            origin: null,
                        })
                            .page(res.results[0]);
                    }
                    // throwing error
                    throw false;
                })
                .then((page) => {
                    bot.send(`${STRINGS.WIKI_PAGE_LINK}\n${page.raw.canonicalurl ? page.raw.canonicalurl : page.raw.fullurl}`, message.peer_id);
                })
                .catch(() => {
                    const options = { forward_messages: message.id };
                    return bot.send(STRINGS.ERR_NO_WIKI_PAGE, message.peer_id, options);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addWikiCommand;
