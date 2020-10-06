import VK, { MessageContext } from 'vk-io';
import BasicCommand from './basic-command';
import { PEER_TYPES } from '../utils/constants';
import { ERRORS, ERRORS_EN } from '../utils/strings';
import BootBot, { FBMessagePayload } from 'bootBot';


export default class NotFoundCommand extends BasicCommand {
    fullName: string;
    shortName: string;
    regexGroup: RegExp;
    regex: RegExp;
    vkBotApi: VK;

    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
        this.shortName = 'uc';
        this.vkBotApi = vkApi;
        this.fbApi = fbApi;
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


    async processCommandFacebook(payload: FBMessagePayload): Promise<any> {
        // @ts-ignore
        if (payload.postback.payload === 'BOOTBOT_GET_STARTED') {
            return;
        }
        return this.processErrorFacebook(payload, ERRORS_EN.COMMAND_NOT_FOUND);
    }

    isCommandAvailable(): boolean {
        return true;
    }
}
