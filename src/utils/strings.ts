export enum ERRORS {
    CARD_NO_CARD = 'Вы не ввели название карты',
    CARD_NOT_FOUND = 'Одна или несколько карт не были найдены',
    CARDS_NOT_FOUND = 'Эти карты не были найдены:',
    CARDS_SEARCH_NOT_FOUND = 'По вашему запросу не найдено ни одной карты',

    PRICE_NO_INFO = 'Нет информации',
    PRICE_SCG_OUT_OF_STOCK_ENG = 'Out of Stock',
    PRICE_SCG_OUT_OF_STOCK_RUS = 'Нет в наличии',

    BAN_MESSAGE_PLACEHOLDER = 'You are globally banned',

    REQUEST_TOO_SHORT = 'Ваш запрос слишком короткий, минимум символов 3',

    COMMAND_NOT_FOUND = 'Команда не найдена, напишите !help чтобы посмотреть список доступных команд',

    AUCTIONS_WATCH_GROUP = 'Данная команда недоступна для групповых чатов',
    AUCTIONS_NOT_FOUND = 'По вашему запросу не было найдено ни одного текущего или завершившегося аукциона',
    AUCTIONS_TOO_MUCH = 'Нельзя отслеживать больше 15 аукцинных запросов одновременно, удалите старый, чтобы добавить новый',
    AUCTIONS_DELETION_WRONG_INDEX = 'Вы ввели неверный индекс элемента',
    AUCTIONS_QUERY_TOO_SHORT = 'В вашем запросе на отслеживание должно быть не менее 4 символов',
    AUCTIONS_QUERY_ALREADY_PRESENT = 'Вы уже отслеживаете данный запрос',

    TOPDECK_REQUEST_TIMEOUT = 'Ошибка в запросе на TopDeck.ru, попробуйте повторить запрос позднее',

    SCRYFALL_REQUEST_TIMEOUT = 'Ошибка в запросе на ScryFall.com, попробуйте повторить запрос позднее',

    WIKI_NOT_FOUND = 'На Wiki не было найдено страниц по вашему запросу',

    NO_PRINTINGS = 'Было найдено 0 изданий этой карты по этому сету',

    GENERAL_ERROR = 'Произошла ошибка в обработке вашего запроса, попробуйте повторить запрос позднее'
}

export enum LOGS {
    STARCITY_PRICE_REQUEST_ERROR = 'StarCityRequest price request has failed \n',
    TOPDECK_PRICE_REQUEST_ERROR = 'TopDeck price request has failed \n',

    GOLDGISH_IMAGE_DELETED = 'Goldfish image has been deleted',
}

export enum GENERAL {
    PAGE = 'Страница',

    TOTAL = 'Всего',

    PRINTINGS = 'изданий',

    PRICE_FOR = 'Цена на',

    STOCK = 'наличие',

    ART = 'Иллюстрация:',
    ARTS = 'Иллюстрации:',

    CARD_NAME = 'Имя карты',

    PRICES_TOPDECK = 'TopDeck (неизвестное издание)',

    WIKI_PAGE_LINK = 'Wiki ссылка:',

    CARDS_SEARCH_MATCH_CRITERIA = 'Найденные карты по вашему запросу',

    PRINTED_LANGUAGES = 'Напечатанные языки',

    LANGUAGE = 'Язык',
}

export enum LANGUAGES {
    LANG_RUS = 'Русский',
    LANG_ENG = 'Английский',
    LANG_ESP = 'Испанский',
    LANG_FR = 'Французский',
    LANG_DE = 'Немецкий',
    LANG_IT = 'Итальянский',
    LANG_PT = 'Португальский',
    LANG_JA = 'Японский',
    LANG_KO = 'Корейский',
    LANG_ZHT = 'Китайский',
    LANG_ZHS = 'Китайский упрощенный',
    LANG_HE = 'Иврит',
    LANG_LA = 'Латынь',
    LANG_GRC = 'Древнегреческий',
    LANG_AR = 'Арабский',
    LANG_SA = 'Санскрит',
    LANG_PX = 'Фирексийский',
}


export enum LEGALITY {
    LEGAL = 'Легальна ✅',
    NOT_LEGAL = 'Нелегальна 🚫',
    BANNED = 'Забанена ⛔',
    RESTRICTED = 'Порестрикчена ❗',
}

export enum FORMATS {
    STANDARD = 'Standard',
    MODERN = 'Modern',
    LEGACY = 'Legacy',
    PAUPER = 'Pauper',
    COMMANDER = 'Commander',
    VINTAGE = 'Vintage',
    PIONEER = 'Pioneer',
    PENNY = 'Penny Dreadful',
    MTGO_COMMANDER = 'MTGO 1v1 Commander',
}

export enum KEYBOARD {
    c = 'Посмотреть изображение карты',
    o = 'Посмотреть oracle карты',
    p = 'Посмотреть цену карты',
    pr = 'Посмотреть издания карты',
    l = 'Посмотреть легальность карты',
}


export enum AUCTIONS {
    CURRENT_MATCH_CRITERIA = 'ТЕКУЩИЕ аукционы подходящие под критерии поиска: ',
    ENDED_MATCH_CRITERIA = 'ЗАВЕРШЕННЫЕ аукционы подходящие под критерии поиска: ',
    NEW_AUCTIONS_MATCH_CRITERIA = '✅ Новые аукционы по вашим запросам ✅',
    NEARLY_AUCTIONS_CRITERIA = '❗ Эти аукционы скоро заканчиваются ❗',

    WATCHED_AUCTIONS_EMPTY = 'У вас нет отслеживаемых аукционных запросов.',

    LOT = 'Лот:',
    CURRENT_BID = 'Текущая ставка:',
    WINNING_BID = 'Финальная ставка:',
    DATE_ESTIMATED = 'Дата окончания:',

    QUERY = 'Ваш запрос',
    QUERY_TRACKED = 'Ваши отслеживаемые запросы:',
    TRACKED = 'теперь отслеживается!',
    NOT_TRACKED = 'больше не отслеживается',


}
