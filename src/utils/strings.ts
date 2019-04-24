export enum ERRORS {
    CARD_NO_CARD = 'Вы не ввели название карты',

    CARD_NOT_FOUND = 'Одна или несколько карт не были найдены',

    BAN_MESSAGE_PLACEHOLDER = 'You are globally banned',

    REQUEST_TOO_SHORT = 'Ваш запрос слишком короткий, минимум символов 3',

    AUCTIONS_NOT_FOUND = 'По вашему запросу не было найдено ни одного текущего или завершившегося аукциона',

    TOPDECK_REQUEST_TIMEOUT = 'Ошибка в запросе на TopDeck.ru, попробуйте повторить запрос позднее',

    GENERAL_ERROR = 'Произошла ошибка в обработке вашего запроса, попробуйте повторить запрос позднее'
}


export enum AUCTIONS {
    CURRENT_MATCH_CRITERIA = 'ТЕКУЩИЕ аукционы подходящие под критерии поиска: ',
    ENDED_MATCH_CRITERIA = 'ЗАВЕРШЕННЫЕ аукционы подходящие под критерии поиска: ',


}
