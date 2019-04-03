import {CommandInterface} from "../types/command";
import VK, {MessageContext} from "vk-io";


export default class NotFoundCommand implements CommandInterface {
    fullName: string;
    shortName: string;
    regexGroup: RegExp;
    regex: RegExp;
    vkBotApi: VK;

    constructor(vkApi: VK, regex?: RegExp) {
        this.vkBotApi = vkApi;
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = /.*/i;
        }
    }

    checkRegex(stringToCheck: string): boolean {
        return this.regex.test(stringToCheck);
    }

    processCommand(msg: MessageContext): Promise<any> {
        if (msg.peerType === 'chat') {
            // console.log(msg);
            return;
        }
        return undefined;
    }

    processError(errorMsg: string, msg: MessageContext): void {
    }

    isCommandAvailable(): boolean {
        return true;
    }
}
