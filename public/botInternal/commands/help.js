const STRINGS = require('../../common/strings');


function addHelpCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/help\b|h\b/i, (message) => {
            const options = { forward_messages: message.id };
            bot.send('Доступные комманды:\n ' +
                'card (c) имя_карты [аббривиатура_сета] ; имя_карты [аббривиатура_сета]  -  показывает изображение запрошенных карт (до 10 изображений в сообщении) из заданного сета, поддерживает все языки MTG  \n\n ' +
                'price (p) имя_карты [аббривиатура_сета]  -  показывает цены TCG mid, MTGO, TopDeck(цена топдека не привязана к изданию) и StarCityGames (или ссылку на лот на SCG при ошибке), поддерживает все языки MTG   \n\n ' +
                'oracle (o)  имя_карты - показывает oracle текст карты, поддерживает все языки MTG   \n\n ' +
                'HelpMe (hm) имя_карты - remember forgotten card name, supports only english names\n\n' +
                'legality (l) имя_карты  - проверяет легальность карты в самых популярных форматах, поддерживает все языки MTG \n\n' +
                'printings (pr) имя_карты | номер_страницы - показывает издания карты, до 10 изданий на странице, поддерживает все языки MTG  \n\n' +
                'art (a) имя_карты [аббривиатура_сета] ; имя_карты [аббривиатура_сета]   -  показывает арт карты (до 10 карт в сообщение) из заданного сета, поддерживает все языки MTG   \n\n  ' +
                'AdvancedSearch (as) поисковая_строка - ищет с помощью https://scryfall.com/docs/reference ТОЛЬКО ДЛЯ ПРОДВИНУТЫХ ПОЛЬЗОВАТЕЛЕЙ, показывает первые 10 сообщений \n\n' +
                'Пример запроса: c темный наперсник', message.peer_id, options);
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addHelpCommand,
};
