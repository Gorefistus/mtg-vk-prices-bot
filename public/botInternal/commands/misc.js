const STRINGS = require('../../common/strings');

async function addFriendsByOne(bot, friendsArray) {
    for (const friend of friendsArray) {
        await bot.api('friends.add', { user_id: friend });
    }
}

function addMiscCommands(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.on('poll-error', (error) => {
            console.log(error);
        });

        bot.on('command-notfound', (msg) => {
            bot.send(STRINGS.COMMAND_NOT_FOUND, msg.peer_id);
        });

        setInterval(() => {
            bot.api('friends.getRequests', { need_viewed: 1 })
                .then((value) => {
                    if (value.count > 0) {
                        addFriendsByOne(bot, value.items);
                    }
                })
                .catch((reason) => {
                    console.log(reason);
                });
        }, 1000 * 45);
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addMiscCommands,
};
