import { CommandInterface } from '../types/command';
import { Bot, replyFunc } from 'node-vk-bot';
import Message from 'node-vk-bot/build/interfaces/Message';
import VK from 'vk-io';


export default class CardCommand implements CommandInterface {
    public vkApi: VK;
    public regex: string;
    public bot: Bot;

    constructor(bot: Bot, vkApi: VK, regex?: string) {
        this.bot = bot;
        this.vkApi = vkApi;
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = 'start';
        }
        bot.get(new RegExp(regex), this.processCommand);
    }

    public checkRegex(stringToCheck: string): boolean {
        return false;
    }

    public async processCommand(msg: Message, exec: RegExpExecArray, reply: replyFunc): Promise<any> {
        // console.log(msg);
    }

    public processError(errorMsg: string, msg: Message, reply: replyFunc): void {
    }
}
