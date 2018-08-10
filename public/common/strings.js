const REQ_TIMEOUT = 'Один или несколько запросов превысили время на ожидание';
const CARD_NOT_FOUND = 'Одна или несколько карт не были найдены!';
const SUGGESTIONS_NOT_FOUND = 'Не могу найти рекомендации';
const NAME_SHORT_ERR = 'Имя карты слишком короткое!';
const NO_DATA = 'Нет информации!';
const PRICE_ERROR = 'Ошибка поиска цены';
const WIKI_PAGE_LINK = 'Wiki ссылка:';

const ERR_PRICES_GENERAL = 'Невозможно найти цены, попробуйте позднее';
const ERR_VK_UPLOAD = 'Couldn\'t upload image to the VK';
const ERR_NO_PRINTINGS = 'Было найдено 0 изданий этой карты по этому сету';
const ERR_NO_WIKI_PAGE = 'Нет такой страницы на Wiki';

const LOG_FILE_DELETED = 'Card image file deleted';

const FORMAT_STANDARD = 'Standard';
const FORMAT_MODERN = 'Modern';
const FORMAT_LEGACY = 'Legacy';
const FORMAT_PAUPER = 'Pauper';
const FORMAT_COMMANDER = 'Commander';
const FORMAT_VINTAGE = 'Vintage';
const FORMAT_PENNY = 'Penny Dreadful';
const FORMAT_MTGO_COMMANDER = 'MTGO 1v1 Commander';


const LEGALITY_LEGAL = 'LEGAL';
const LEGALITY_NOT_LEGAL = 'NOT LEGAL';
const LEGALITY_BANNED = 'BANNED';
const LEGALITY_RESTRICTED = 'RESTRICTED';

const COMMAND_NOT_FOUND = 'Команда не найдена, попробуйте !m help чтобы посмотреть список команд';
const COMMAND_NOT_ADDED = 'Bot object is undefined, command not added';


const LANG_RUS = 'Русский';
const LANG_ENG = 'Английский';
const LANG_ESP = 'Испанский';
const LANG_FR = 'Французский';
const LANG_DE = 'Немецкий';
const LANG_IT = 'Итальянский';
const LANG_PT = 'Португальский';
const LANG_JA = 'Японский';
const LANG_KO = 'Корейский';
const LANG_ZHT = 'Китайский';
const LANG_ZHS = 'Китайский упрощенный';
const LANG_HE = 'Иврит';
const LANG_LA = 'Латынь';
const LANG_GRC = 'Древнегреческий';
const LANG_AR = 'Арабский';
const LANG_SA = 'Санскрит';
const LANG_PX = 'Фирексийский';


const BOT_ERROR = 'Bot could not be started';


module.exports = {
    REQ_TIMEOUT,
    CARD_NOT_FOUND,
    SUGGESTIONS_NOT_FOUND,
    NAME_SHORT_ERR,
    COMMAND_NOT_FOUND,
    NO_DATA,
    PRICE_ERROR,
    WIKI_PAGE_LINK,
    FORMAT_STANDARD,
    FORMAT_MODERN,
    FORMAT_LEGACY,
    FORMAT_PAUPER,
    FORMAT_COMMANDER,
    FORMAT_VINTAGE,
    FORMAT_PENNY,
    FORMAT_MTGO_COMMANDER,
    LEGALITY_LEGAL,
    LEGALITY_NOT_LEGAL,
    LEGALITY_BANNED,
    LEGALITY_RESTRICTED,
    LANG_ENG,
    LANG_RUS,
    LANG_ESP,
    LANG_FR,
    LANG_DE,
    LANG_IT,
    LANG_PT,
    LANG_JA,
    LANG_KO,
    LANG_ZHT,
    LANG_ZHS,
    LANG_HE,
    LANG_LA,
    LANG_GRC,
    LANG_AR,
    LANG_SA,
    LANG_PX,
    COMMAND_NOT_ADDED,
    BOT_ERROR,
    PRICES_ERR_GENERAL: ERR_PRICES_GENERAL,
    LOG_FILE_DELETED,
    ERR_VK_UPLOAD,
    ERR_NO_PRINTINGS,
    ERR_NO_WIKI_PAGE,
};
