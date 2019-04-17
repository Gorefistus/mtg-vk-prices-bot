import VK, {MessageContext} from 'vk-io';

export interface CommandInterface {
    vkBotApi: VK;

    fullName?: string;

    shortName?: string;

    regex?: RegExp;

    regexGroup?: RegExp;

    checkRegex(stringToCheck: string, isGroup?: boolean): boolean;

    processCommand(msg: MessageContext): Promise<any>;

    processError(msg: MessageContext, errorMsg?: string): void;

    isCommandAvailable(msg?: MessageContext): boolean;

}
