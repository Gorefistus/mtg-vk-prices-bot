import { CommandInterface } from 'command';
import VK, { MessageContext } from 'vk-io';
import { REGEX_CONSTANTS } from '../utils/constants';
import { ERRORS } from '../utils/strings';


export default class BasicCommand implements CommandInterface {
    fullName: string;
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string;
    vkBotApi: VK;


    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        this.vkBotApi = vkApi;
        this.fullName = 'BASIC';
        this.shortName = 'BC';
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = /start/i;
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})(${this.shortName}|${this.fullName}) (.*)`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    checkRegex(stringToCheck: string, isGroup?: boolean): boolean {
        return isGroup ? this.regexGroup.test(stringToCheck) : this.regex.test(stringToCheck);
    }

    isCommandAvailable(msg?: MessageContext): boolean {
        return false;
    }

    async processCommand(msg: MessageContext): Promise<any> {
        return undefined;
    }

    processError(msg: MessageContext, errorMsg = ERRORS.GENERAL_ERROR): void {
        msg.reply(errorMsg);
    }

}