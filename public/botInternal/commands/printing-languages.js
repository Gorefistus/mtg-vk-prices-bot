const request = require('request-promise-native');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addPrintingLanguagesCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        const printignLanguagesRegexp = new RegExp(`${CONSTANTS.BOT_PREFIX_GROUP}[${CONSTANTS.BOT_PREFIX_ENDINGS}]? ?\\b(printinglanguages|pl) (.*)`, 'im');

        bot.get(printignLanguagesRegexp, (message) => {
            stats.track(message.user_id, { msg: message.text }, 'pl');
            bot.sendTyping(message);
            let cardName = message.text.match(printignLanguagesRegexp)[3];
            const setNameRegex = message.text.match(new RegExp(`${CONSTANTS.BOT_PREFIX_GROUP}[${CONSTANTS.BOT_PREFIX_ENDINGS}]? ?\\b(printinglanguages|pl) (.*)\\[(.{3,4})\\]`, 'i'));
            const setCode = setNameRegex !== null ? setNameRegex[4] : undefined;
            if (setCode) {
                cardName = setNameRegex[3];
            }
            let cardObject;
            MISC.getMultiverseId(cardName, setCode, true)
                .then((card) => {
                    cardObject = card;
                    return request({
                        uri: encodeURI(`${CONSTANTS.SCRY_API_LINK}!"${card.name}"s:${card.set}&include_multilingual=true&unique=prints`),
                        json: true,
                    });
                })
                .then((printings) => {
                    if (printings.total_cards <= 0) {
                        return bot.send(STRINGS.ERR_NO_PRINTINGS, message.peer_id);
                    }
                    let printingsLanguagesString = `Напечатанные языки ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} [${cardObject.set_name}]:\n`;
                    const alreadyShownLanguages = [];
                    for (let printing of printings.data) {
                        if (!alreadyShownLanguages.includes(printing.lang)) {
                            alreadyShownLanguages.push(printing.lang);
                            printingsLanguagesString += `Язык: ${MISC.getLanguageByLangCode(printing.lang)}. Имя карты: ${printing.printed_name ? printing.printed_name : printing.name}\n`;
                        }
                    }
                    return bot.send(printingsLanguagesString, message.peer_id);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addPrintingLanguagesCommand;
