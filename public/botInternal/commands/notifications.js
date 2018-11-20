const CONSTANTS = require('../../common/constants');
const STRINGS = require('../../common/strings');
const SpoilerCache = require('../../common/spoiler');


function checkForAdmin(userId, admins) {
    if (userId === 6874525) {
        return true;
    }
    if (admins.length === 0 || !userId) {
        return false;
    }
    return admins.filter(admin => admin.member_id === userId).length > 0;
}


function addNotificationsCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        const regex = new RegExp(`[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]notifications|[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]n`, 'i');
        bot.get(regex, async (message) => {
            const admins = (await bot.api('messages.getConversationMembers', { peer_id: message.peer_id }))
                .items
                .filter(member => (
                    member.is_admin
                ));
            if (admins.length === 0) {
                return bot.send(STRINGS.ERR_NOT_A_GROUP, message.peer_id);
            }
            if (checkForAdmin(message.user_id, admins)) {
                const group = await SpoilerCache.getMailingGroup(message.peer_id);
                if (group) {
                    SpoilerCache.updateMailingGroupStatus(message.peer_id, !group.mailing);
                    return bot.send(`${STRINGS.NOTIFICATIONS_GENERAL}${!group.mailing ? `${STRINGS.NOTIFICATIONS_ENABLED}` : `${STRINGS.NOTIFICATIONS_DISABLED}`}`, message.peer_id);
                }
                SpoilerCache.addGroupToSpoilersMailing(message.peer_id);
                return bot.send(`${STRINGS.NOTIFICATIONS_GENERAL}${STRINGS.NOTIFICATIONS_ENABLED}`, message.peer_id);
            }
            return bot.send(STRINGS.ERR_NOT_AN_ADMIN, message.peer_id);

        });
    }
}


module.exports = addNotificationsCommand;
