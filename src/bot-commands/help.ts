import BasicCommand from './basic-command';
import VK, { ButtonColor, Keyboard, MessageContext } from 'vk-io';
import { REGEX_CONSTANTS } from '../utils/constants';
import BootBot, { FBMessagePayload } from 'bootbot';


export default class HelpCommand extends BasicCommand {

    fullName: string; // help
    regex: RegExp;
    regexGroup: RegExp;
    shortName: string;  // help
    vkBotApi: VK;

    constructor(vkApi: VK, fbApi: BootBot, regex?: RegExp, regexGroup?: RegExp) {
        super(vkApi, fbApi,  regex, regexGroup);
        this.fullName = 'help';
        this.fbApi = fbApi;
        if (regex) {
            this.regex = regex;
        } else {
            this.regex = new RegExp(`^(${REGEX_CONSTANTS.GROUP_PREFIX} |${REGEX_CONSTANTS.PREFIX})(${this.fullName})`, REGEX_CONSTANTS.REGEX_FLAGS);
        }
    }

    checkRegex(stringToCheck: string): boolean {
        return this.regex.test(stringToCheck);
    }

    async processCommand(msg: MessageContext): Promise<any> {
        const helpString = 'Доступные команды:\n ' +
            '!card (c) имя_карты [аббривиатура_сета] ; имя_карты [аббривиатура_сета]  -  показывает изображение запрошенных карт (до 10 изображений в сообщении) из заданного сета, поддерживает русские и английские имена  \n\n ' +
            '!price (p) имя_карты [аббривиатура_сета]  -  показывает цены TCG mid, MTGO, TopDeck(цена топдека не привязана к изданию) и StarCityGames (или ссылку на лот на SCG при ошибке), поддерживает русские и английские имена  \n\n ' +
            '!oracle (o)  имя_карты - показывает oracle текст карты, поддерживает русские и английские имена   \n\n ' +
            '!legality (l) имя_карты  - проверяет легальность карты в самых популярных форматах, поддерживает русские и английские имена \n\n' +
            '!printings (pr) имя_карты[ | номер_страницы] - показывает издания карты, до 10 изданий на странице, поддерживает русские и английские имена  \n\n' +
            '!art (a) имя_карты [аббривиатура_сета] ; имя_карты [аббривиатура_сета]   -  показывает арт карты (до 10 карт в сообщение) из заданного сета, поддерживает русские и английские имена   \n\n  ' +
            '!AdvancedSearch (as) поисковая_строка[ | номер_страницы] - ищет с помощью https://scryfall.com/docs/reference ТОЛЬКО ДЛЯ ПРОДВИНУТЫХ ПОЛЬЗОВАТЕЛЕЙ, показывает 10 результатов на страницу \n\n' +
            '!auctions (ac) [поисковая строка]  - поиск по текущим аукционном с заданой поисковой строкой, если поисковая строка не задана, возвращает ближайшие к завершению аукционы, лимит результатов - 5 аукционов за сообщение   \n\n' +
            '!PrintingLanguages (pl) имя_карты[аббривиатура_сета] - показывает языки и имя карты на этом языке, на котором печаталась данная карта в данном сете, поддерживает все языки MTG\n\n' +
            '!watchActions (wa) поисковая_строка - включает поиск по аукционам на сайте TopDeck.ru. Может быть вызвана с двумя флагами: -l и -r, при первом флаге показывает список запросов для поиска, при втором удаляет поисковой запрос, запрос без флага добавляет новый поисковой запрос. Пример использования команды ниже \n\n' +
            '!wiki (w) поисковая_строка - выдает ссылку на первую статью на https://mtg.gamepedia.com по результату поиска по заданной поисковой_строке, поддерживает только английский язык\n\n' +
            '!roll (xdy) или (x-y) - возвращает результат броска х кубиков с y сторонами или целое число между х и y включительно\n\n' +
            '!расписание - выводит расписание для текущего чата \n\n' +
            '!setSchedule (ss) текст_расписания - меняет текущее расписание (команда доступна для всех администраторов) \n\n' +
            '!admins (ad) - выводит список администраторов для текущего чата\n\n' +
            '!setAdmins (sa) id_администратора - добавляет администратора в текущий чат (команда доступна для всех администраторов)\n\n' +
            '!removeAdmins (ra) id_администратора - убирает пользователя из списка администраторов в текущем чате (команда ТОЛЬКО для главного администратора)\n\n' +
            'Параметры, указанные в квадратных скобках [параметр] являются НЕОБЯЗАТЕЛЬНЫМИ  \n\n' +
            'Пример запроса: !c темный наперсник \n\n\n' +
            'Пример запроса WatchAuctions: !wa jace mind sculptor - это добавит новый поисковой запрос. !wa -r 1 - этот запрос удалит имеющий у вас запрос на jace mind scluptor. Чтобы посмотреть индексы запросов, вызовите команду с флагом -l \n\n' +
            'Тема на топдеке для отзывов и предложений:\n https://topdeck.ru/forums/topic/121143-mtgpricebot-%D0%B1%D0%BE%D1%82-%D0%B4%D0%BB%D1%8F-%D0%B2%D0%B0%D1%88%D0%B5%D0%B3%D0%BE-vk-%D1%87%D0%B0%D1%82%D0%B8%D0%BA%D0%B0/\n' +
            'Группа VK: https://vk.com/mtgbot\n\n\n' +
            'Попробуйте эти команды чтобы начать: \n';
        msg.send(helpString, {
            keyboard: Keyboard.keyboard([[Keyboard.textButton({
                label: '!c удар молнии',
                color: ButtonColor.POSITIVE,
            }), Keyboard.textButton({
                label: '!p крокса титан',
                color: ButtonColor.PRIMARY
            })]]).inline(true)
        });
    }

    async processCommandFacebook(payload: FBMessagePayload): Promise<any> {
        const helpString = 'Available commands: \n' +
            '!card (c) card_name [SET_EXPANSION_CODE] ; card_name [SET_EXPANSION_CODE] - shows image(s) of the requested card(s), up to ten per message. Example: !c dark confidant; search for az [xln]\n\n' +
            '!price (p) card_name [SET_EXPANSION_CODE] - shows TCG, MTGO, StarCityGames prices for requested card. Example: !p wasteland\n\n' +
            '!art (a) card_name [SET_EXPANSION_CODE] ; card_name [SET_EXPANSION_CODE] - shows art image(s) of the requested card(s), up to ten per message. Example: !a dark confidant; search for az [xln]\n\n' +
            '!oracle (o) card_name - shows oracle text for requested card\n\n' +
            '!legality (l) card_name - show legality for requested card in most popular formats \n\n' +
            '!!! Parameters in parentheses ARE optional !!!';
        this.fbApi.say(payload.sender.id, helpString);
        return this.fbApi.say(payload.sender.id, {
            text: ' Try out this commands!',
            quickReplies: ['!c dark conf[rav]', '!o black lotus', '!p death shadow']
        });
    }
}
