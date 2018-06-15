function addAnnouncmentCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]announcment[\s])/i, message => {
            const messageBody = message.body.match(/([m|h][\s]announcment[\s])(.*)/i)[2];
            if (message.user_id === 6874525 && messageBody.length > 0) {
                bot.api('messages.getDialogs')
                    .then(dialogs => {
                        const userGroups = dialogs.items.filter((dialog) => {
                            return dialog.message.users_count && dialog.message.users_count > 3;
                        });
                        userGroups.forEach((group) => {
                            bot.api('messages.send', {
                                chat_id: group.message.chat_id,
                                message: messageBody,
                            });
                        });
                    });
            } else {
                console.log('Wrong foul tried to use this command' + message.user_id);
            }
        });
    }
}


module.exports = {
    addAnouncmentCommand: addAnnouncmentCommand,
};
