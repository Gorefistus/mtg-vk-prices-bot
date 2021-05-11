import BasicCommand from './basic-command';
import VK, { MessageContext } from 'vk-io';
import BootBot from 'bootbot';
import AdministrationHelper from '../utils/database/administration-helper';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { ERRORS } from '../utils/strings';


export default class SetSchedule extends BasicCommand {
    fullName: string; // 'setSchedule';
    shortName: string; // 'ss';
    regex: RegExp;
    regexGroup: RegExp;
    vkBotApi: VK;

    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'setSchedule';
        this.shortName = 'ss';
        this.fbApi = fbApi;
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = new RegExp(`^(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX}?)(${this.shortName}|${this.fullName}) (.*)?`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})(${this.shortName}|${this.fullName}) (.*)?`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    async processCommand(msg: MessageContext): Promise<any> {

        const {peerType, peerId, senderId, text} = msg;
        const scheduleText = text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];

        if (PEER_TYPES.GROUP !== peerType) {
            return;
        }

        try {
            const isAdmin = await AdministrationHelper.isAdmin(peerId, senderId);
            if (!isAdmin) {
                return this.processError(msg, ERRORS.NOT_AVAILABLE);
            }
            AdministrationHelper.setSchedule(peerId, senderId, scheduleText);
            return msg.send('Расписание обновлено');
        } catch (e) {
            console.log(e);
            return this.processError(msg);
        }
    }
}
