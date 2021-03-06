import BasicCommand from './basic-command';
import VK, { MessageContext } from 'vk-io';
import { getGoldfishDeckImage } from '../utils/goldfish-utils';
import BootBot from 'bootbot';

export default class GoldfishDeckPresenter extends BasicCommand {

    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'gd';
        this.shortName = 'gd';
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = new RegExp(/https:\/\/www\.mtggoldfish\.com\/deck\/\d+/im);
        }
        this.regexGroup = this.regex;
    }

    async processCommand(msg: MessageContext): Promise<any> {

        const commandString = msg.messagePayload ? msg.messagePayload.command : msg.text;

        const link = commandString.match(this.regex)[0];
        const id = Number.parseInt(link.match(/\d+/)[0]);

        const image = await getGoldfishDeckImage(this.vkBotApi, id);
        const attachment = `photo${image.ownerId}_${image.id},`;

        return msg.reply('', {attachment});

    }
}
