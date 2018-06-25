const fs = require('fs');
const path = require('path');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


async function runPromisesInSequence(bot, promises) {
    try {
        const resultsArray = [];
        for (let promise of promises) {
            const resolved = await MISC.promiseReflect(bot.uploadPhoto(path.resolve(promise.v.toString())));
            if (resolved.status === 'resolved') {
                resultsArray.push(resolved);
            }
        }
        return resultsArray;
    } catch (e) {
        console.log(e);
    }
}

function downloadAndPostCardImage(bot, cards, peerId) {
    if (cards && cards.length > 0 && bot && peerId) {
        const promisesDownloadArray = [];
        // generating array of Promises for us to resolve, we need to wait for all of them to post a message
        for (const index in cards) {
            const card = cards[index];
            // double faced cards have many images in them, we need to handle that
            if (card.image_uris === undefined && card.card_faces && card.card_faces.length > 0) {
                card.card_faces.forEach((face) => {
                    if (promisesDownloadArray.length < 10) {
                        promisesDownloadArray.push(MISC.downloadCardImage(face.image_uris.normal));
                    }
                });
            } else {
                if (promisesDownloadArray.length < 10) {
                    promisesDownloadArray.push(MISC.downloadCardImage(card.image_uris.normal));
                }
            }
        }
        Promise.all(promisesDownloadArray.map(MISC.promiseReflect)).then(
            (values) => {
                const resolvedPromises = values.filter(value => value.status === 'resolved');
                // do something with rejected promises

                runPromisesInSequence(bot, resolvedPromises)
                    .then(photoValues => {
                        const resolvedPhotoPromises = photoValues.filter(value => value.status === 'resolved');
                        let attachmentString = '';
                        for (const index in resolvedPhotoPromises) {
                            attachmentString = `${attachmentString}photo${resolvedPhotoPromises[index].v.owner_id}_${resolvedPhotoPromises[index].v.id},`;
                        }
                        const options = { attachment: attachmentString };
                        bot.send('', peerId, options).catch(reason => {
                            console.log(reason);});
                        resolvedPromises.forEach(((value) => {
                            fs.unlink(value.v);
                        }));
                    });
            },
            (reason) => {
            // this should never occur due to our reflect pattern
                console.log(reason);
            },
        ).catch(reason => {
            console.log(reason);});
    } else {
        console.error('Error uploading photos to VK');
    }
}


function addCardCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/[m|h][\s]card[\s,]|[m|h][\s]c[\s]/i, (message) => {
            const cardNames = message.body.match(/([m|h][\s]card[\s]|[m|h][\s]c[\s])(.*)/i)[2];
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
                Promise.all(cardRequestPromisesArray.map(MISC.promiseReflect)).then((values) => {
                    const resolvedPromises = values.filter(value => value.status === 'resolved');
                    const rejectedPromises = values.filter(value => value.status === 'rejected');
                    downloadAndPostCardImage(bot, resolvedPromises.map(result => result.v), message.peer_id);
                    let didRequestTimeout = false;
                    let didCardNotFound = false;
                    let processedArrayElements = 0;
                    rejectedPromises.forEach((rejected, index) => {
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

module.exports = {
    addCardCommand,
};
