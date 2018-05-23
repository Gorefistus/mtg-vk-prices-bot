const constants = require('./constants');
const strings = require('./strings');
const request = require('request');


function getLegality(legality){
    switch (legality){
        case constants.LEGALITY_LEGAL:
            return strings.LEGALITY_LEGAL;
        case constants.LEGALITY_BANNED:
            return strings.LEGALITY_BANNED;
        case constants.LEGALITY_NOT_LEGAL:
            return strings.LEGALITY_NOT_LEGAL;
        case constants.LEGALITY_RESTRICTED:
            return strings.LEGALITY_RESTRICTED;
    }
}



function downloadCardImage(uri, callback){
    request.head(uri,  (err, res, body) => {
        const fileName = Date.now().toString()+'.jpg';
        request(uri).pipe(fs.createWriteStream(fileName)).on('close',()=> callback(fileName));
    });
}


module.exports = {
    getLegality,
    downloadCardImage
};