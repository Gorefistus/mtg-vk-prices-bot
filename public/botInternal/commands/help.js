const STRINGS = require('../../common/strings');


function addHelpCommand(bot) {
    if (bot && typeof bot.get === 'function') {
        bot.get(/[m|h][\s]help\b|[m|h][\s]h\b/i, (message) => {
            const options = { forward_messages: message.id };
            bot.send('Доступные команды:\n ' +
                '!m card (c) имя_карты [аббривиатура_сета] ; имя_карты [аббривиатура_сета]  -  показывает изображение запрошенных карт (до 10 изображений в сообщении) из заданного сета, поддерживает все языки MTG  \n\n ' +
                '!m  price (p) имя_карты [аббривиатура_сета]  -  показывает цены TCG mid, MTGO, TopDeck(цена топдека не привязана к изданию) и StarCityGames (или ссылку на лот на SCG при ошибке), поддерживает все языки MTG   \n\n ' +
                '!m  oracle (o)  имя_карты - показывает oracle текст карты, поддерживает все языки MTG   \n\n ' +
                '!m  HelpMe (hm) имя_карты - remember forgotten card name, supports only english names\n\n' +
                '!m  legality (l) имя_карты  - проверяет легальность карты в самых популярных форматах, поддерживает все языки MTG \n\n' +
                '!m  printings (pr) имя_карты | номер_страницы - показывает издания карты, до 10 изданий на странице, поддерживает все языки MTG  \n\n' +
                '!m  art (a) имя_карты [аббривиатура_сета] ; имя_карты [аббривиатура_сета]   -  показывает арт карты (до 10 карт в сообщение) из заданного сета, поддерживает все языки MTG   \n\n  ' +
                '!m  AdvancedSearch (as) поисковая_строка - ищет с помощью https://scryfall.com/docs/reference ТОЛЬКО ДЛЯ ПРОДВИНУТЫХ ПОЛЬЗОВАТЕЛЕЙ, показывает первые 10 сообщений \n\n' +
                '!m PrintingLanguages(pl) имя_карты[аббривиатура_сета] - показывает языки и имя карты на этом языке, на котором печаталась данная карта в данном сете' +
                'Пример запроса: !m  c темный наперсник \n\n\n' +
                'Тема на топдеке для отзывов и предложений:\n https://topdeck.ru/forums/topic/121143-mtgpricebot-%D0%B1%D0%BE%D1%82-%D0%B4%D0%BB%D1%8F-%D0%B2%D0%B0%D1%88%D0%B5%D0%B3%D0%BE-vk-%D1%87%D0%B0%D1%82%D0%B8%D0%BA%D0%B0/', message.peer_id, options);
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = {
    addHelpCommand,
};
