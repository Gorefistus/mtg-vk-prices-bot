const fs = require('fs');
const path = require('path');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


async function runPromisesInSequence(bot, promises) {
    const resultsArray = [];
    for (const promise of promises) {
        const resolved = await MISC.promiseReflect(bot.uploadPhoto(path.resolve(promise.v.toString())));
        if (resolved.status === 'resolved') {
            resultsArray.push(resolved);
        }
    }
    return resultsArray;
}

function downloadAndPostCardImage(bot, cards, peerId) {
    if (cards && cards.length > 0 && bot && peerId) {
        const promisesDownloadArray = [];
        // generating array of Promises for us to resolve, we need to wait for all of them to post a message
        for (const card of cards) {
            // double faced cards have many images in them, we need to handle that
            if (card.image_uris === undefined && card.card_faces && card.card_faces.length > 0) {
                card.card_faces.forEach((face) => {
                    if (promisesDownloadArray.length < 10) {
                        promisesDownloadArray.push(MISC.downloadCardImage(face.image_uris.art_crop));
                    }
                });
            } else if (promisesDownloadArray.length < 10) {
                promisesDownloadArray.push(MISC.downloadCardImage(card.image_uris.art_crop));
            }
        }
        Promise.all(promisesDownloadArray.map(MISC.promiseReflect))
            .then(
                (values) => {
                    const resolvedPromises = values.filter(value => value.status === 'resolved');
                    // do something with rejected promises

                    runPromisesInSequence(bot, resolvedPromises)
                        .then((photoValues) => {
                            const resolvedPhotoPromises = photoValues.filter(value => value.status === 'resolved');
                            let attachmentString = '';
                            for (const photoPromise of resolvedPhotoPromises) {
                                attachmentString =
                                    `${attachmentString}photo${photoPromise.v.owner_id}_${photoPromise.v.id},`;
                            }
                            const options = { attachment: attachmentString };
                            bot.send('', peerId, options)
                                .catch((reason) => {
                                    console.log(reason);
                                });
                            resolvedPromises.forEach(((value) => {
                                fs.unlink(value.v, () => {
                                    console.log(STRINGS.LOG_FILE_DELETED);
                                });
                            }));
                        })
                        .catch(() => {
                            bot.send(STRINGS.ERR_VK_UPLOAD, peerId);
                        });
                },
                (reason) => {
                    // this should never occur due to our reflect pattern
                    console.log(reason);
                },
            )
            .catch((reason) => {
                console.log(reason);
            });
    } else {
        console.error('Error uploading photos to VK');
    }
}


function addArtCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/(\[club168593903.*\].*|^)(art[\s]|a[\s])/i, (message) => {
            const cardNames = message.text.match(/(\[club168593903.*\].*|^)(art[\s]|a[\s])(.*)/i)[3];
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

module.exports = {
    addArtCommand,
};
