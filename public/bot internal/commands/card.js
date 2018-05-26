const fs = require('fs');
const path = require("path");

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function downloadAndPostCardImage(bot, card, peerId) {
    MISC.downloadCardImage(card.image_uris.normal, (filename) => {
        const absolutePath = path.resolve(filename);
        bot.uploadPhoto(absolutePath).then(photo => {
            fs.unlink(filename, () => {
                console.log(STRINGS.FILE_DELETED);
            });
            const options = {attachment: `photo${photo.owner_id}_${photo.id}`};
            bot.send('', peerId, options);
        }, reason => {
            bot.send(card.image_uris.normal, peerId);
            console.error(`Couldn't upload an image`);
            console.log(reason);
            fs.unlink(filename, () => {
                console.log(STRINGS.FILE_DELETED);
            });
        });
    });
}


function addCardCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/[m|h][\s]card[\s,]|[m|h][\s]c[\s]/i, message => {
            const cardNames = message.body.match(/([m|h][\s]card[\s]|[m|h][\s]c[\s])(.*)/i)[2];
            const splittedCardNames = cardNames.split(';');
            splittedCardNames.forEach(cardName => {
                let cardSetSplit = cardName.match(/(.*)\[(.{3,4})\]/i);
                if (cardSetSplit !== null) {
                    MISC.getMultiverseId(cardSetSplit[1], cardSetSplit[2]).then(value => {
                        if (value.image_uris === undefined && value.card_faces && value.card_faces.length > 0) {
                            for (let face in value.card_faces) {
                                downloadAndPostCardImage(bot, value.card_faces[face], message.peer_id);
                            }
                        } else {
                            downloadAndPostCardImage(bot, value, message.peer_id);
                        }

                    }, reason => {
                        if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                            return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                        }
                        const options = {forward_messages: message.id};
                        bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                    });
                } else {
                    MISC.getMultiverseId(cardName).then(value => {
                        if (value.image_uris === undefined && value.card_faces && value.card_faces.length > 0) {
                            for (let face in value.card_faces) {
                                downloadAndPostCardImage(bot, value.card_faces[face], message.peer_id);
                            }
                        } else {
                            downloadAndPostCardImage(bot, value, message.peer_id);
                        }

                    }, reason => {
                        if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                            return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                        }
                        const options = {forward_messages: message.id};
                        bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                    });
                }
            });

        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED)
    }
}

module.exports = {
    addCardCommand
};