import { Bot, replyFunc } from 'node-vk-bot';
import Message from 'node-vk-bot/build/interfaces/Message';
import VK from 'vk-io';

export interface CommandInterface {
    bot: Bot;
    vkApi?: VK;

    regex?: string;

    checkRegex(stringToCheck: string): boolean;

    processCommand(msg: Message, exec: RegExpExecArray, reply: replyFunc): Promise<any>;

    processError(errorMsg: string, msg: Message, reply: replyFunc): void;

}
