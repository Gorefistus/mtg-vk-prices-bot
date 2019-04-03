import { CommandInterface } from "../types/command";
import VK, { MessageContext } from "vk-io";
import { CONSTANTS, PEER_TYPES } from "../utils/constants";
import AdministrationHelper from "../utils/administration-helper";


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
            this.regexGroup = new RegExp(`(${CONSTANTS.GROUP_PREFIX} |${CONSTANTS.PREFIX})${this.shortName}|${this.fullName}`, CONSTANTS.REGEX_FLAGS);
            console.log(this.regexGroup);
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
        let adminObject = await AdministrationHelper.getItem({id: msg.peerId});
        if (!adminObject) {
            adminObject = await AdministrationHelper.createItem({id: msg.peerId});
        }
        console.log(adminObject);
    }

    processError(errorMsg: string, msg: MessageContext): void {
        msg.reply(errorMsg);
    }

}
