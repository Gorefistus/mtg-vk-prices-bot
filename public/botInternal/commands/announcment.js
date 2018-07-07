function addAnnouncmentCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/(announcment[\s])/i, (message) => {
            const messageBody = message.text.match(/(announcment[\s])(.*)/i)[2];
            if (message.user_id === 6874525 && messageBody.length > 0) {
                bot.api('messages.getDialogs')
                    .then((dialogs) => {
                        const userGroups = dialogs.items
                            .filter(dialog =>
                                dialog.message.users_count && dialog.message.users_count > 3);
                        userGroups.forEach((group, index) => {
                            setTimeout(() => {
                                bot.api('messages.send', {
                                    chat_id: group.message.chat_id,
                                    message: messageBody,
                                });
                            }, 500 * (index + 1));
                        });
                    });
            } else {
                console.log(`Wrong foul tried to use this command${message.user_id}`);
            }
        });
    }
}


module.exports = {
    addAnouncmentCommand: addAnnouncmentCommand,
};
