const TIMEOUT_CODE = 'ETIMEDOUT';


const BOT_PREFIX_SMALL = '!m';
const BOT_PREFIX = '!mth';
const BOT_PREFIX_GROUP = '([club168593903|@mtgbot] )?';

const BOT_PREFIX_ENDINGS = 'm|h';

const LEGALITY_LEGAL = 'legal';
const LEGALITY_NOT_LEGAL = 'not_legal';
const LEGALITY_BANNED = 'banned';
const LEGALITY_RESTRICTED = 'restricted';


const STANDARD = 'standard';
const MODERN = 'modern';
const LEGACY = 'legacy';
const PAUPER = 'pauper';
const COMMANDER = 'commander';
const VINTAGE = 'vintage';


const LANG_RUS = 'rus';
const LANG_ENG = 'eng';

const LANG_RUS_SCRY = 'ru';
const LANG_ENG_SCRY = 'en';
const LANG_ESP = 'es';
const LANG_FR = 'fr';
const LANG_DE = 'de';
const LANG_IT = 'it';
const LANG_PT = 'pt';
const LANG_JA = 'ja';
const LANG_KO = 'ko';
const LANG_ZHT = 'zht';
const LANG_ZHS = 'zhs';
const LANG_HE = 'he';
const LANG_LA = 'la';
const LANG_GRC = 'grc';
const LANG_AR = 'ar';
const LANG_SA = 'sa';
const LANG_PX = 'px';

const STAR_CITY_PRICE_LINK = 'http://www.starcitygames.com/results?name=';
const TOPDECK_PRICE_LINK = 'https://topdeck.ru/apps/toptrade/api-v1/singles/search?q=';
const TOPDECK_AUCTIONS_LINK = 'https://topdeck.ru/apps/toptrade/api-v1/auctions';
const TOPDECK_AUCTIONS_FINISHED_LINK = 'https://topdeck.ru/apps/toptrade/auctions/finished';
const TOPDECK_AUCTIONS_FINISHED_SEARCH_LINK = 'https://topdeck.ru/apps/toptrade/api-v1/auctions/search?q=';
const MTGGOLDFISH_PRICE_LINK = 'https://www.mtggoldfish.com/price/';

const SCRY_API_LINK = 'https://api.scryfall.com/cards/search?q=';
const WIKI_LINK = 'https://mtg.gamepedia.com/api.php';

const DB_NAME_PRICES = 'prices';
const DB_NAME_IMAGES = 'images';
const DB_NAME_SPOILERS = 'spoilers';

const CACHE_ENTRY_DURATION = 1000 * 60 * 60 * 24;//Three days in milliseconds;

const MOMENT_AUCTIONS_FORMAT ='Do MMM YYYY';

module.exports = {
    TIMEOUT_CODE,
    LEGALITY_BANNED,
    LEGALITY_LEGAL,
    LEGALITY_NOT_LEGAL,
    LEGALITY_RESTRICTED,
    STANDARD,
    MODERN,
    LEGACY,
    PAUPER,
    COMMANDER,
    VINTAGE,
    LANG_RUS,
    LANG_ENG,
    LANG_ESP,
    LANG_FR,
    LANG_DE,
    LANG_IT,
    LANG_PT,
    LANG_JA,
    LANG_KO,
    LANG_ZHT,
    LANG_ZHS,
    LANG_RUS_SCRY,
    LANG_ENG_SCRY,
    LANG_HE,
    LANG_LA,
    LANG_GRC,
    LANG_AR,
    LANG_SA,
    LANG_PX,
    STAR_CITY_PRICE_LINK,
    TOPDECK_PRICE_LINK,
    TOPDECK_AUCTIONS_LINK,
    TOPDECK_AUCTIONS_FINISHED_LINK,
    TOPDECK_AUCTIONS_FINISHED_SEARCH_LINK,
    MTGGOLDFISH_PRICE_LINK,
    SCRY_API_LINK,
    WIKI_LINK,
    CACHE_ENTRY_DURATION,
    DB_NAME_PRICES,
    DB_NAME_IMAGES,
    DB_NAME_SPOILERS,
    BOT_PREFIX_SMALL,
    BOT_PREFIX,
    BOT_PREFIX_ENDINGS,
    BOT_PREFIX_GROUP,
    MOMENT_AUCTIONS_FORMAT,
};
