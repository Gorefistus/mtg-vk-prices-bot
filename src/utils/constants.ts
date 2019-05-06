export enum REGEX_CONSTANTS {
    "GROUP_PREFIX" = '\\[club168593903|@mtgbot\\]',
    "PREFIX" = '!n',
    "POSTFIX" = 'n',
    "REGEX_FLAGS" = 'im',
}


export enum PEER_TYPES {
    "GROUP" = 'chat',
    "PRIVATE" = 'user',
}


export enum DB_CONSTANTS {
    "CACHE_EXPIRE_DURATION" = 1000 * 60 * 60 * 24// One day in milliseconds;
}

export enum DB_NAMES {
    "ADMINISTRATION" = 'db_admin',
    "IMAGES" = 'images',
    "PRICES" = 'prices'
}


export enum COMMAND_IDS {
    "CARD" = 'CARD_COMMAND_ID',
    "ADMINISTRATION" = 'ADMINSTRATION_COMMAND_ID',
}


export enum LANGS {
    LANG_RUS = 'rus',
    LANG_ENG = 'eng',
}

export enum LANGS_SCRY {
    LANG_RUS_SCRY = 'ru',
    LANG_ENG_SCRY = 'en',
}

export enum API_LINKS {
    STAR_CITY_PRICE = 'http://www.starcitygames.com/results?name=',
    TOPDECK_PRICE = 'https://topdeck.ru/apps/toptrade/api-v1/singles/search?q=',
    TOPDECK_AUCTIONS = 'https://topdeck.ru/apps/toptrade/api-v1/auctions',
    TOPDECK_AUCTIONS_FINISHED_ = 'https://topdeck.ru/apps/toptrade/auctions/finished',
    TOPDECK_AUCTIONS_FINISHED_SEARCH = 'https://topdeck.ru/apps/toptrade/api-v1/auctions/search?q=',
    MTGGOLDFISH_PRICE = 'https://www.mtggoldfish.com/price/',
    SCRY_API = 'https://api.scryfall.com/cards/search?q=',
    WIKI_MTG = 'https://mtg.gamepedia.com/api.php',
}


export enum TIME_CONSTANTS {
    AUCTIONS ='Do MMM YYYY',
}
