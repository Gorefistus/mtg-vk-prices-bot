export enum REGEX_CONSTANTS {
    'GROUP_PREFIX' = '\\[club168593903|@mtgbot\\]',
    'PREFIX' = '!',
    'POSTFIX' = 'n',
    'REGEX_FLAGS' = 'im',
}


export enum PEER_TYPES {
    'GROUP' = 'chat',
    'PRIVATE' = 'user',
}


export enum DB_CONSTANTS {
    'CACHE_EXPIRE_DURATION' = 1000 * 60 * 60 * 24, // One day in milliseconds;
    'AUC_EXPIRE_DATE' = 60 * 30, // 30 minutes in seconds
    'AUC_REFRESH_RATE' = 1000 * 90, // 90 seconds in milliseconds;
    'RESULTS_PER_PAGE' = 15,
}

export enum DB_NAMES {
    'ADMINISTRATION' = 'db_admin',
    'IMAGES' = 'images',
    'PRICES' = 'prices',
    'AUCTIONS' = 'auctions',
}


export enum COMMAND_IDS {
    'c' = 'с',
    'p' = 'p',
    'o' = 'o',
    'l' = 'l',
    'pr' = 'pr',
}

export const ColorIndexes = ['primary', 'negative', 'positive', 'default'];


export enum LANGS {
    LANG_RUS = 'rus',
    LANG_ENG = 'eng',
    LANG_ESP = 'es',
    LANG_FR = 'fr',
    LANG_DE = 'de',
    LANG_IT = 'it',
    LANG_PT = 'pt',
    LANG_JA = 'ja',
    LANG_KO = 'ko',
    LANG_ZHT = 'zht',
    LANG_ZHS = 'zhs',
    LANG_HE = 'he',
    LANG_LA = 'la',
    LANG_GRC = 'grc',
    LANG_AR = 'ar',
    LANG_SA = 'sa',
    LANG_PX = 'px',
}

export enum LANGS_SCRY {
    LANG_RUS_SCRY = 'ru',
    LANG_ENG_SCRY = 'en',
}

export enum LEGALITY {
    LEGAL = 'legal',
    NOT_LEGAL = 'not_legal',
    BANNED = 'banned',
    RESTRICTED = 'restricted',
}

export enum API_LINKS {
    STAR_CITY_PRICE = 'http://www.starcitygames.com/search.php?search_query=',
    TOPDECK_PRICE = 'https://topdeck.ru/apps/toptrade/api-v1/singles/search?q=',
    TOPDECK_AUCTIONS = 'https://topdeck.ru/apps/toptrade/api-v1/auctions',
    TOPDECK_AUCTIONS_SITE = ' https://topdeck.ru/apps/toptrade/auctions/',
    TOPDECK_AUCTIONS_FINISHED_ = 'https://topdeck.ru/apps/toptrade/auctions/finished',
    TOPDECK_AUCTIONS_FINISHED_SEARCH = 'https://topdeck.ru/apps/toptrade/api-v1/auctions/search?q=',
    MTGGOLDFISH_PRICE = 'https://www.mtggoldfish.com/price/',
    SCRY_API = 'https://api.scryfall.com/cards/search?q=',
    WIKI_MTG = 'https://mtg.gamepedia.com/api.php',
}


export enum TIME_CONSTANTS {
    AUCTIONS = 'Do MMM YYYY',
}
