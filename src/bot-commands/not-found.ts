import VK, { MessageContext } from 'vk-io';
import BasicCommand from './basic-command';
import { PEER_TYPES } from '../utils/constants';
import { ERRORS } from '../utils/strings';


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

    async processCommand(msg: MessageContext): Promise<any> {
        if (PEER_TYPES.GROUP !== msg.peerType) {
            return this.processError(msg, ERRORS.COMMAND_NOT_FOUND);
        }
    }


    isCommandAvailable(): boolean {
        return true;
    }
}
