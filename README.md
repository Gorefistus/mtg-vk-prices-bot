# MTG VK Prices Bot

This [bot](https://vk.com/mtgpricebot) is created to help you with your everyday magic needs in your chat in social network VK. Add [bot](https://vk.com/mtgpricebot) to your friends or just PM him to start working. 

## Getting Started

You'll need a [token](https://vk.com/dev/access_token) for the bot:

get yourself one:
```
https://oauth.vk.com/authorize?client_id=YOUR_APP_ID&scope=photos,messages,offline&display=touch&response_type=token
```

Your token goes into bot startup setting in index-old.js.


### Starting up

Start bot with 
```
npm run start
```

After the bot started, message him 

```
!MTH help
```
to get the list of available commands.


## Built With

* [mtg-vk-bot](https://github.com/vitalyavolyn/node-vk-bot) - Basis for the bot and VK API
* [scryfall-sdk](https://github.com/Yuudaari/scryfall-sdk) - Main SDK for card search

## License

This project is licensed under the Apache 2.0 - see the [LICENSE.md](LICENSE) file for details
