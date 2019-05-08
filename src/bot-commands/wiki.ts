import wiki from 'wikijs';
import VK, { MessageContext } from 'vk-io';


import BasicCommand from './basic-command';
import { API_LINKS, PEER_TYPES, REGEX_CONSTANTS } from '../utils/constants';
import { ERRORS, GENERAL } from '../utils/strings';

export default class WikiCommand extends BasicCommand {
    fullName: string; // wiki
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string;  // w
    vkBotApi: VK;

    constructor(vkApi: VK, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, regex, regexGroup);
        this.fullName = 'wiki';
        this.shortName = 'w';
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = /start/i;
        }
        if (regexGroup) {
            this.regexGroup = regexGroup;
        } else {
            this.regexGroup = new RegExp(`(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})(${this.shortName}|${this.fullName})( .*)?`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }


    async processCommand(msg: MessageContext): Promise<any> {
        const searchQuery = msg.text.match(PEER_TYPES.GROUP === msg.peerType ? this.regexGroup : this.regex)[3];

        try {
            const searchResults = await wiki({apiUrl: API_LINKS.WIKI_MTG, origin: null}).search(searchQuery);
            if (searchResults && searchResults.results && searchResults.results.length > 0) {
                const wikiLink = await wiki({apiUrl: API_LINKS.WIKI_MTG, origin: null}).page(searchResults.results[0]);
                // @ts-ignore
                msg.send(`${GENERAL.WIKI_PAGE_LINK}\n${wikiLink.raw.canonicalurl ? wikiLink.raw.canonicalurl : wikiLink.raw.fullurl}`);
            } else {
                return this.processError(msg, ERRORS.WIKI_NOT_FOUND);
            }

        } catch (e) {
            if (!e) {
                return this.processError(msg, ERRORS.CARD_NOT_FOUND);
            }
            console.log(e);
            return this.processError(msg);
        }
    }
}
