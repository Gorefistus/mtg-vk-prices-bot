"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CardCommand {
    constructor(bot, vkApi, regex) {
        this.bot = bot;
        this.vkApi = vkApi;
        if (regex) {
            this.regex = regex;
        }
        else {
            this.regex = 'start';
        }
        bot.get(new RegExp(regex), this.processCommand);
    }
    checkRegex(stringToCheck) {
        return false;
    }
    processCommand(msg, exec, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(msg);
        });
    }
    processError(errorMsg, msg, reply) {
    }
}
exports.default = CardCommand;
//# sourceMappingURL=card.js.map