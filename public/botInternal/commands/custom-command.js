const yargs = require('yargs');


const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');

function checkForAdmin(userId, admins) {
    if (userId === 6874525) {
        return true;
    }
    if (admins.length === 0 || !userId) {
        return false;
    }
    return admins.filter(admin => admin.member_id === userId).length > 0;
}


function addCustomCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        yargs.command('add', 'adds custom command', {
            adminOnly: {
                alias: 'a',
                default: false,
            },
            message: {
                alias: 'm',
                default: 'No message defined for the command',
            },
            name: {
                alias: 'n',
            },
        })
            .help();
        bot.get(new RegExp(`[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]customCommand[\\s]|[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]cc[\\s]`, 'i'), async (message) => {
            const args = message.body.match(new RegExp(`([${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]customCommand[\\s]|[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]cc[\\s])(.*)`, 'i'))[2];
            console.log(message);
            const admins = (await bot.api('messages.getConversationMembers', { peer_id: message.peer_id }))
                .items
                .filter(member => (
                    member.is_admin
                ));
            console.log(admins);
            if (admins.length === 0) {
                return bot.send(STRINGS.ERR_NOT_A_GROUP, message.peer_id);
            }
            if (checkForAdmin(message.user_id, admins)) {
                console.log(yargs.parse(args));
                const parsedArgs = yargs.parse(args);
                bot.get(new RegExp(`${parsedArgs.name}`), commandMessage => (bot.send(parsedArgs.message, commandMessage.peer_id)));
                return bot.send('COMMAND SHOULD BE ADDED', message.peer_id);
            }
            return bot.send(STRINGS.ERR_NOT_AN_ADMIN, message.peer_id);
            // console.log(yargs.parse(args.split(' ')));
        });
    }
}

module.exports = addCustomCommand;
