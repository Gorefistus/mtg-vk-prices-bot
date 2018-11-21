const CONSTANTS = require('../../common/constants');
const SpoilerCache = require('../../common/spoiler');
const request = require('request-promise-native');

let spoilerCount = 74;


async function checkNewSpoilers() {
    try {
        const spoilers = JSON.parse(await request('https://api.scryfall.com/cards/search?order=spoiled&q=e%3Auma&unique=prints'));
        if (spoilers.total_cards > spoilerCount) {
            return spoilers;
        }
        return undefined;
    } catch (e) {
        console.log(e);
        return undefined;
    }
}

function triggerAnnouncment(bot) {
    setInterval(async () => {
        const spoilers = await checkNewSpoilers();
        if (spoilers) {
            const mailingGroups = (await SpoilerCache.getAllMailingGroups()).filter(elem => (elem.mailing));
            const newCardsLength = spoilers.total_cards - spoilerCount;
            const newSpoilers = spoilers.data.filter((elem, index) => {
                return index + 1 <= newCardsLength && index < 10;
            });
            let sendText = 'Новые спойлеры: \n';
            for (const newSpoiler of newSpoilers) {
                sendText = `${sendText} ${newSpoiler.name} \n`;
            }
            sendText = `${sendText}\n`;
            for (const newSpoiler of newSpoilers) {
                sendText = `${sendText} ${newSpoiler.image_uris.normal} \n`;
            }
            sendText = `${sendText} \n  Эти уведомления администратор беседы может отключить командой !m notifications`;
            mailingGroups.forEach(async (group, index) => {
                setTimeout(() => {
                    bot.send(sendText, group.groupId)
                        .catch(reason => console.log(reason));
                }, 1000 * (index + 1));
            });
            spoilerCount = spoilers.total_cards;
        } else {
            //do nothing

        }
    }, 1000 * 60 * 5);
}


function startMailingSpoilers(bot) {
    if (bot && typeof bot.get === 'function') {
        const regex = new RegExp(`[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]globalann`, 'i');
        bot.get(regex, async (message) => {
            const sendText = 'Полный спойлер: \n https://magic.wizards.com/en/articles/archive/card-image-gallery/ultimate-masters-2018-11-19?a';
            const mailingGroups = (await SpoilerCache.getAllMailingGroups()).filter(elem => (elem.mailing));
            mailingGroups.forEach(async (group, index) => {
                setTimeout(() => {
                    bot.send(sendText, group.groupId)
                        .catch(reason => console.log(reason));
                }, 1000 * (index + 1));
            });
        });
    }
}



function addAnnouncmentCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        startMailingSpoilers(bot);
        const regex = new RegExp(`[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]announcment|[${CONSTANTS.BOT_PREFIX_ENDINGS}][\\s]an`, 'i');
        request('https://api.scryfall.com/cards/search?order=spoiled&q=e%3Auma&unique=prints')
            .then((value) => {
                const parsedValue = JSON.parse(value);
                spoilerCount = parsedValue.total_cards;
            });

        bot.get(regex, async (message) => {
            if (message.user_id === 6874525) {
                // bot.api('messages.getDialogs')
                //     .then((dialogs) => {
                //         const userGroups = dialogs.items
                //             .filter(dialog =>
                //                 dialog.message.users_count && dialog.message.users_count >= 40);
                //         console.log(userGroups.length);
                //         userGroups.forEach(group => {
                //             SpoilerCache.addGroupToSpoilersMailing(group.message.chat_id);
                //         });
                //     })

                    // .catch(reason => console.log(reason));
                triggerAnnouncment(bot);
            } else {
                console.log(`Wrong foul tried to use this command${message.user_id}`);
            }
        });
    }
}


module.exports = addAnnouncmentCommand;
