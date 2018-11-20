const CONSTANTS = require('../common/constants');
const DBHelper = require('../common/db/DBHelper');


function addGroupToSpoilersMailing(groupId) {
    const groupData = {
        groupId: groupId > 10000 ? groupId : 2000000000 + groupId, //VK API thingie
        mailing: true,
    };

    DBHelper.addItemDocumentToCollection(groupData, CONSTANTS.DB_NAME_SPOILERS);
}

async function getMailingGroup(groupId) {
    return DBHelper.getItemFromCollection({ groupId }, CONSTANTS.DB_NAME_SPOILERS);
}

function removeGroupFromSpoilersMailing(groupId) {
    DBHelper.updateItemInCollection({ groupId }, { mailing: false }, CONSTANTS.DB_NAME_SPOILERS);
}

function updateMailingGroupStatus(groupId, status){
    DBHelper.updateItemInCollection({ groupId }, { mailing: status }, CONSTANTS.DB_NAME_SPOILERS);

}

async function getAllMailingGroups() {
    return DBHelper.getAllItemsFromCollection(CONSTANTS.DB_NAME_SPOILERS);
}



module.exports = {
    addGroupToSpoilersMailing,
    removeGroupFromSpoilersMailing,
    getAllMailingGroups,
    getMailingGroup,
    updateMailingGroupStatus,
};
