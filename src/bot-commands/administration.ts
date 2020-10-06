import VK, { MessageContext } from 'vk-io';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import AdministrationHelper from '../utils/database/administration-helper';
import { ERRORS } from '../utils/strings';
import BasicCommand from './basic-command';
import BootBot from 'bootBot';


export default class AdministrationCommand extends BasicCommand {
    fullName: string; // administration
    shortName: string; // ad
    regex: RegExp;
    regexGroup: RegExp;
    vkBotApi: VK;


    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'administration';
        this.shortName = 'ad';
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = /start/i;
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})${this.shortName}|${this.fullName}`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    isCommandAvailable(msg: MessageContext): boolean {
        return PEER_TYPES.GROUP === msg.peerType;
    }

    async processCommand(msg: MessageContext): Promise<any> {
        if (!this.isCommandAvailable(msg)) {
            this.processError(msg, ERRORS.REQUEST_TOO_SHORT);
        }
        let adminObject = await AdministrationHelper.getItem({groupId: msg.peerId});
        if (!adminObject) {
            adminObject = await AdministrationHelper.createItem({groupId: msg.peerId, ownerId: msg.senderId});
        }
        console.log(adminObject.bannedUsers[msg.senderId]);
        const user = adminObject.bannedUsers[msg.senderId];
        if (user && user.allDisabled) {
            this.processError(msg, ERRORS.BAN_MESSAGE_PLACEHOLDER);
        }
    }

}
