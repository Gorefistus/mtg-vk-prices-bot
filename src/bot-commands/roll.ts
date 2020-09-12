import BasicCommand from './basic-command';
import VK, { MessageContext } from 'vk-io';
import { PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { ERRORS } from '../utils/strings';
import  { Random } from 'random-js';


export default class RollCommand extends BasicCommand {
    fullName: string; // 'legality';
    shortName: string; // 'l';
    regex: RegExp;
    regexGroup: RegExp;
    diceRegex: RegExp;
    numberRegex: RegExp;
    vkBotApi: VK;


    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.vkBotApi = vkApi;
        this.fullName = 'roll';
        this.shortName = 'r';
        this.diceRegex = new RegExp(REGEX_CONSTANTS.DICE, REGEX_CONSTANTS.REGEX_FLAGS);
        this.numberRegex = new RegExp(REGEX_CONSTANTS.NUMBER, REGEX_CONSTANTS.REGEX_FLAGS);
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
        const commandString = msg.messagePayload ? msg.messagePayload.command : msg.text;
        const commandValues = commandString.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];
        const properRandom = new Random();
        if (this.diceRegex.test(commandValues)) {
            const [, numberOfDice, , diceFaces] = commandValues.match(this.diceRegex);
            if (numberOfDice <= 0 || diceFaces <= 0) {
                return this.processError(msg, ERRORS.ROLL_ZERO_VALUES);
            }
            if (numberOfDice > 50) {
                return this.processError(msg, ERRORS.ROLL_BIG_VALUES);
            }
            if (diceFaces > 1000) {
                return this.processError(msg, ERRORS.ROLL_BIG_VALUES);
            }
            const diceRolls: Array<number> = [];
            let sumOfRolls = 0;
            for (let i = 0; i < numberOfDice; i++) {
                const rollValue = properRandom.integer(1, diceFaces);
                diceRolls.push(rollValue);
                sumOfRolls = sumOfRolls + rollValue;
            }
            return msg.reply(`Результат: ${sumOfRolls} (${diceRolls.join(', ')})`);

        } else if (this.numberRegex.test(commandValues)) {
            const [, minVal, , maxVal] = commandValues.match(this.numberRegex);
            if (minVal <= 0 || maxVal <= 0) {
                return this.processError(msg, ERRORS.ROLL_ZERO_VALUES);
            }
            if (maxVal < minVal) {
                return this.processError(msg, ERRORS.ROLL_MAX_MIN);
            }
            return msg.reply(`Результат: ${properRandom.integer(minVal, maxVal)}`);
        } else
            return this.processError(msg, ERRORS.ROLL_WRONG_FORMAT);
    }

}
