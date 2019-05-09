import VK, { MessageContext } from 'vk-io';
import BasicCommand from './basic-command';


export default class NotFoundCommand extends BasicCommand {
    fullName: string;
    shortName: string;
    regexGroup: RegExp;
    regex: RegExp;
    vkBotApi: VK;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
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


    isCommandAvailable(): boolean {
        return true;
    }
}
