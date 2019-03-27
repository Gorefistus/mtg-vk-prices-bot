const creds = require('../../../creds.json');


function test(bot, vkApi) {
    bot.on(async (ctx) => {
        if (ctx.message.text === 'start') {
            console.log(ctx.message, ctx.message.peer_id);
            const test1 = await vkApi.api.messages.getConversationMembers({
                peer_id: ctx.message.peer_id,
            });
            console.log(test1);
            ctx.reply('No commands for you.');
        }
    });
}

module.exports = test;
