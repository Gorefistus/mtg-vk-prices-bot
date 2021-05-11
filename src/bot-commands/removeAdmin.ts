import BasicCommand from './basic-command';
import VK, { MessageContext } from 'vk-io';
import BootBot from 'bootbot';
import AdministrationHelper from '../utils/database/administration-helper';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { ERRORS } from '../utils/strings';


export default class RemoveAdmin extends BasicCommand {
    fullName: string; // 'setAdmin';
    shortName: string; // 'sa';
    regex: RegExp;
    regexGroup: RegExp;
    vkBotApi: VK;

    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'remove';
        this.shortName = 'ra';
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
        const userId = text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];

        if (PEER_TYPES.GROUP !== peerType) {
            return;
        }
        try {
            const isOwner = await AdministrationHelper.isOwner(peerId, senderId);
            if (!isOwner) {
                return this.processError(msg, ERRORS.NOT_AVAILABLE);
            }
            try {
                const user = (await this.vkBotApi.api.users.get({user_ids: userId}))[0];
                if (await AdministrationHelper.isAdmin(peerId, user.id)) {
                    await AdministrationHelper.removeAdmin(peerId, user.id);
                    return msg.reply(`Пользователь ${user.first_name} ${user.last_name} был удален из списка администраторов`);
                }
                return this.processError(msg, ERRORS.USER_NOT_ADMIN);

            } catch {
                return this.processError(msg, ERRORS.USER_NOT_FOUND);
            }

        } catch (e) {
            console.log(e);
            return this.processError(msg);
        }
    }
}
