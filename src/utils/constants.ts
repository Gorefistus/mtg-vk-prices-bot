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
