import { CommandInterface } from "command.d.ts";
import VK, { MessageContext } from "vk-io";
import { REGEX_CONSTANTS, PEER_TYPES } from "../utils/constants";
import AdministrationHelper from "../utils/database/administration-helper";


export default class AdministrationCommand implements CommandInterface {
    fullName: string; // administration
    shortName: string; // ad
    regex: RegExp;
    regexGroup: RegExp;
    vkBotApi: VK;


    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
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


    checkRegex(stringToCheck: string, isGroup?: boolean): boolean {
        return isGroup ? this.regexGroup.test(stringToCheck) : this.regex.test(stringToCheck);
    }

    isCommandAvailable(msg: MessageContext): boolean {
        return PEER_TYPES.GROUP === msg.peerType;
    }

    async processCommand(msg: MessageContext): Promise<any> {
        if (!this.isCommandAvailable(msg)) {
            this.processError('НЕТ_ДОСТУПА_PLACEHOLDER', msg);
        }
        let adminObject = await AdministrationHelper.getItem({groupId: msg.peerId});
        if (!adminObject) {
            adminObject = await AdministrationHelper.createItem({groupId: msg.peerId, ownerId: msg.senderId});
        }
        console.log(adminObject.bannedUsers[msg.senderId]);
        const user = adminObject.bannedUsers[msg.senderId];
        if (user && user.allDisabled) {
            this.processError('You are globally banned', msg);
        }
    }

    processError(errorMsg: string, msg: MessageContext): void {
        msg.reply(errorMsg);
    }

}
