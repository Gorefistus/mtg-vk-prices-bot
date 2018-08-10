const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');

function addOracleCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/([m|h][\s]oracle[\s]|[m|h][\s]o[\s])/i, (message) => {
            stats.track(message.user_id, { msg: message.body }, 'o');
            const cardName = message.body.match(/([m|h][\s]oracle[\s,]|[m|h][\s]o[\s])(.*)/i)[2];
            MISC.getMultiverseId(cardName)
                .then((value) => {
                    let oracleText = '';
                    if (value.card_faces && value.card_faces.length > 0) {
                        value.card_faces.forEach((face) => {
                            oracleText = `${oracleText}\n 
                            ${face.name} oracle text :\nMana cost: ${face.mana_cost.length > 0 ? face.mana_cost : 'None'} 
                    ${face.type_line}
                    \n${face.oracle_text}
                    ${face.loyalty ? `\nStarting loyalty: ${face.loyalty}` : ''}
                    \n\t\t${face.power ? `🗡: ${face.power}` : ''} ${face.toughness ? `🛡: ${face.toughness}` : ''}`;
                        });
                    } else {
                        oracleText = `${value.name} oracle text :\nMana cost: ${value.mana_cost.length > 0 ? value.mana_cost : 'None'} 
                    ${value.type_line}
                    \n${value.oracle_text}
                    ${value.loyalty ? `\nStarting loyalty: ${value.loyalty}` : ''}
                    \n${value.power ? `🗡: ${value.power}` : ''} ${value.toughness ? `🛡: ${value.toughness}` : ''}`;
                    }
                    bot.send(oracleText, message.peer_id);
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


module.exports = addOracleCommand;
