const request = require('request-promise-native');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addPrintingLanguagesCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]printinglanguages[\s]|[m|h][\s]pl[\s])/i, (message) => {
            let cardName = message.body.match(/([m|h][\s]printinglanguages[\s,]|[m|h][\s]pl[\s])(.*)/i)[2];
            const setNameRegex = message.body.match(/([m|h][\s]printinglanguages[\s,]|[m|h][\s]pl[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
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
                    let printingsLanguagesString = `Напечатанные языки ${cardObject.name} [${cardObject.set_name}]:\n`;
                    for (let printing of printings.data) {
                        printingsLanguagesString += `Язык: ${MISC.getLanguageByLangCode(printing.lang)}. Имя карты: ${printing.printed_name ? printing.printed_name : printing.name}\n`;
                    }
                    return bot.send(printingsLanguagesString, message.peer_id);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addPrintingLanguagesCommand
};
