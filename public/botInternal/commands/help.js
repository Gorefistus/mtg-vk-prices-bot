const STRINGS = require('../../common/strings');


function addHelpCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/[m|h][\s]help\b|[m|h][\s]h\b/i, (message) => {
            const options = { forward_messages: message.id };
            bot.send('Доступные комманды:\n ' +
                '!m card (c) имя_карты [аббривиатура_сета] ; имя_карты [аббривиатура_сета]  -  показывает изображение запрошенных карт (до 10 изображений в сообщении) из заданного сета, поддерживает все языки MTG  \n\n ' +
                '!m price (p) имя_карты [аббривиатура_сета]  -  показывает цены TCG mid, MTGO, TopDeck(цена топдека не привязана к изданию) и StarCityGames (или ссылку на лот на SCG при ошибке), поддерживает все языки MTG   \n\n ' +
                '!m oracle (o)  имя_карты - показывает oracle текст карты, поддерживает все языки MTG   \n\n ' +
                '!m HelpMe (hm) имя_карты - remember forgotten card name, supports only english names\n\n' +
                '!m legality (l) имя_карты  - проверяет легальность карты в самых популярных форматах, поддерживает все языки MTG \n\n' +
                '!m printings (pr) имя_карты | номер_страницы - показывает издания карты, до 10 изданий на странице, поддерживает все языки MTG  \n\n' +
                '!m art (a) имя_карты [аббривиатура_сета] ; имя_карты [аббривиатура_сета]   -  показывает арт карты (до 10 карт в сообщение) из заданного сета, поддерживает все языки MTG   \n\n  ' +
                '!m AdvancedSearch (as) поисковая_строка - ищет с помощью https://scryfall.com/docs/reference ТОЛЬКО ДЛЯ ПРОДВИНУТЫХ ПОЛЬЗОВАТЕЛЕЙ, показывает первые 10 сообщений \n\n' +
                'Пример запроса: !m c темный наперсник', message.peer_id, options);
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addHelpCommand,
};
