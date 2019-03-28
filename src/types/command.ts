import VK, {MessageContext} from 'vk-io';

export interface CommandInterface {
    vkBotApi?: VK;

    regex?: RegExp;

    regexGroup?: RegExp;

    checkRegex(stringToCheck: string, isGroup?: boolean): boolean;

    processCommand(msg: MessageContext): Promise<any>;

    processError(errorMsg: string, msg: MessageContext): void;

}
