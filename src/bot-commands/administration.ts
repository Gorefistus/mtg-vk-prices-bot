import {CommandInterface} from "../types/command";
import VK, {MessageContext} from "vk-io";
import {CONSTANTS, PEER_TYPES} from "../utils/constants";
import AdministrationHelper from "../utils/administration-helper";


export default class AdministrationCommand implements CommandInterface {
    regex: RegExp;
    regexGroup: RegExp;
    vkBotApi: VK;


    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        this.vkBotApi = vkApi;
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = /start/i;
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`${CONSTANTS.PREFIX} (.*)`, CONSTANTS.REGEX_FLAGS)
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
        let adminObject = await AdministrationHelper.getItem({id:msg.peerId});
        if(!adminObject){
            adminObject = await AdministrationHelper.createItem({id:msg.peerId});
        }
    }

    processError(errorMsg: string, msg: MessageContext): void {
        msg.reply(errorMsg);
    }

}
