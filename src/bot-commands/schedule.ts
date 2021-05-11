import BasicCommand from './basic-command';
import VK, { MessageContext } from 'vk-io';
import BootBot from 'bootbot';
import AdministrationHelper from '../utils/database/administration-helper';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';


export default class Schedule extends BasicCommand {
    fullName: string; // 'setAdmin';
    shortName: string; // 'sa';
    regex: RegExp;
    regexGroup: RegExp;
    vkBotApi: VK;

    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'расписание';
        this.shortName = 'ра';
        this.fbApi = fbApi;
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = /start/i;
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`^(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})${this.shortName}|${this.fullName}`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    async processCommand(msg: MessageContext): Promise<any> {
        const {peerType, peerId, senderId} = msg;

        if (PEER_TYPES.GROUP !== peerType) {
            return;
        }
        try {
            return msg.reply(await AdministrationHelper.getSchedule(peerId, senderId));
        } catch (e) {
            console.log(e);
            return this.processError(msg);
        }
    }
}
