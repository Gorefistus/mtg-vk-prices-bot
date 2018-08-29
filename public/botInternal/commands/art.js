const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');

function downloadAndPostCardImage(bot, cards, peerId) {
    if (cards && cards.length > 0 && bot && peerId) {
        let imageCounter = 0;
        // generating array of Promises for us to resolve, we need to wait for all of them to post a message
        let artistNames = cards.length > 1 ? 'Иллюстрации: ' : 'Иллюстрация: ';
        let cardLinks = '\n';
        for (const card of cards) {
            artistNames = `${artistNames} ${card.artist};`;
            // double faced cards have many images in them, we need to handle that
            if (card.image_uris === undefined && card.card_faces && card.card_faces.length > 0) {
                card.card_faces.forEach((face) => {
                    if (imageCounter < 10) {
                        cardLinks = `${cardLinks} ${face.image_uris.art_crop} \n`;
                        imageCounter++;
                    }
                });
            } else if (imageCounter < 10) {
                cardLinks = `${cardLinks} ${card.image_uris.art_crop} \n`;
                imageCounter++;
            }
        }

        return bot.send(artistNames + cardLinks, peerId);

    } else {
        console.error('Error uploading photos to VK');
    }
}


function addArtCommand(bot, stats) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/[m|h][\s]art[\s,]|[m|h][\s]a[\s]/i, (message) => {
            stats.track(message.user_id, { msg: message.body }, 'a');
            const cardNames = message.body.match(/([m|h][\s]art[\s]|[m|h][\s]a[\s])(.*)/i)[2];
            const splittedCardNames = cardNames.split(';');
            // make it no more than 10 cards

            if (splittedCardNames.length > 0) {
                const cardRequestPromisesArray = [];
                for (let i = 0; i < 10 && i < splittedCardNames.length; i++) {
                    const cardSetSplit = splittedCardNames[i].match(/(.*)\[(.{3,4})\]/i);
                    if (cardSetSplit !== null) {
                        cardRequestPromisesArray.push(MISC.getMultiverseId(cardSetSplit[1], cardSetSplit[2]));
                    } else {
                        cardRequestPromisesArray.push(MISC.getMultiverseId(splittedCardNames[i]));
                    }
                }
                Promise.all(cardRequestPromisesArray.map(MISC.promiseReflect))
                    .then((values) => {
                        const resolvedPromises = values.filter(value => value.status === 'resolved');
                        const rejectedPromises = values.filter(value => value.status === 'rejected');
                        downloadAndPostCardImage(bot, resolvedPromises.map(result => result.v), message.peer_id);
                        let didRequestTimeout = false;
                        let didCardNotFound = false;
                        let processedArrayElements = 0;
                        rejectedPromises.forEach((rejected) => {
                            if (rejected.e && rejected.e.error && CONSTANTS.TIMEOUT_CODE === rejected.e.error.code) {
                                didRequestTimeout = true;
                            } else {
                                didCardNotFound = true;
                            }
                            // JS forEach doesn't provide an callback when all operations are done, so we improvise
                            processedArrayElements++;
                            if (processedArrayElements === rejectedPromises.length) {
                                if (didRequestTimeout) {
                                    return bot.send(STRINGS.REQ_TIMEOUT, message.peer_id);
                                } else if (didCardNotFound) {
                                    const options = { forward_messages: message.id };
                                    return bot.send(STRINGS.CARD_NOT_FOUND, message.peer_id, options);
                                }
                            }
                        });
                    }, (reason) => {
                        console.log(reason);
                    });
            }
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}

module.exports = addArtCommand;
