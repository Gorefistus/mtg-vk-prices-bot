const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addPriceCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]price[\s]|[m|h][\s]p[\s])/i, (message) => {
            let cardName = message.body.match(/([m|h][\s]price[\s,]|[m|h][\s]p[\s])(.*)/i)[2];
            const setNameRegex = message.body.match(/([m|h][\s]price[\s,]|[m|h][\s]p[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
            }
            MISC.getMultiverseId(cardName, setCode)
                .then((value) => {
                    bot.send(`${value.name} prices :\n TCG Mid: ${value.usd ? `${value.usd} $` : STRINGS.NO_DATA} \n MTGO: ${value.tix ? `${value.tix} tix` : STRINGS.NO_DATA}`, message.peer_id);
                }, (reason) => {
                    if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                        return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                    }
                    const options = { forward_messages: message.id };
                    bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addPriceCommand,
};
