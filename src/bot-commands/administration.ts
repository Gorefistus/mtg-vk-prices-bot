import VK, { MessageContext } from 'vk-io';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import AdministrationHelper from '../utils/database/administration-helper';
import { ERRORS } from '../utils/strings';
import BasicCommand from './basic-command';
import BootBot from 'bootbot';


export default class AdministrationCommand extends BasicCommand {
    fullName: string; // administration
    shortName: string; // ad
    regex: RegExp;
    regexGroup: RegExp;
    vkBotApi: VK;


    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
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
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})${this.shortName}|${this.fullName}`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    isCommandAvailable(msg: MessageContext): boolean {
        return PEER_TYPES.GROUP === msg.peerType;
    }

    async processCommand(msg: MessageContext): Promise<any> {
        if (!this.isCommandAvailable(msg)) {
            this.processError(msg, ERRORS.REQUEST_TOO_SHORT);
        }
        try {
            const adminObject = await AdministrationHelper.getOrCreateGroupSettings({
                groupId: msg.peerId,
                ownerId: msg.senderId
            });
            const owner = (await this.vkBotApi.api.users.get({user_ids: adminObject.ownerId.toString()}))[0];
            const admins = await this.vkBotApi.api.users.get({user_ids: adminObject.admins.map(userId => userId.toString())});
            let replyString = `Главный администратор: @id${owner.id} (${owner.first_name} ${owner.last_name}) `;
            admins.forEach(admin => {
                replyString = replyString + `\nАдминистратор:  @id${admin.id} (${admin.first_name} ${admin.last_name})`;
            });
            return msg.reply(replyString);
        } catch (e) {
            console.log(e);
            return this.processError(msg);
        }
    }

}
