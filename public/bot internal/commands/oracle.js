const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');

function addOracleCommand(bot) {

    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]oracle[\s]|[m|h][\s]o[\s])/i, message => {
            const cardName = message.body.match(/([m|h][\s]oracle[\s,]|[m|h][\s]o[\s])(.*)/i)[2];
            MISC.getMultiverseId(cardName).then(value => {
                let oracleText = '';
                if (value.card_faces && value.card_faces.length > 0) {
                    value.card_faces.forEach((face) => {
                        oracleText = oracleText + '\n\n' + face.oracle_text;
                    })
                } else {
                    oracleText = value.oracle_text;
                }
                bot.send(`${value.name} oracle text :\n ${oracleText}`, message.peer_id);
            }, reason => {
                if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                    return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                }
                const options = {forward_messages: message.id};
                bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
            });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED)

    }
}


module.exports = {
    addOracleCommand
};