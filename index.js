/* ************** Подключение модулей ************** */
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const fs = require('fs');
const database = require('./database');
const observer = require('./observer');
const config = require('./config');

/* ************** Подключаем БД ************** */
database()
   .then(() => {
      console.log('MongoDB running at:  ' + config.mongo_url);
   })
   .catch((e) => {
      console.error("DATABASE:\nUnable to connect to database!\n" + e);
      process.exit(1);
   });

const ExchangeRate = require('./models/ExchangeRate');
const Sticker = require('./models/Sticker');

/* ************** Создание бота ************** */
const token = config.token;
const bot = new TelegramBot(token, {
   polling: true
});

observer(ExchangeRate);

/* ************** Ответы на запросы ************** */
bot.onText(/\/echo (.+)/, (msg, match) => {
   const chatId = msg.chat.id;
   const resp = match[1];
   bot.sendMessage(chatId, resp);
});

bot.onText(/\/spam (.+)/, (msg, match) => {
   const chatId = msg.chat.id;
   let res = match[1];
   try {
      if (res != '')
         res = parseInt(res);
      else
         res = 1
      for(let i = 0; i < res; i++) {
         setTimeout(() => {
            let previous = {};
            let t = 0;
            while (t < 50) {
               request(config.assets.quotes_api, (err, req, body) => {
                  if (err) console.error(err);
                  else {
                     const content = JSON.parse(body);
                     if (content != previous) {
                        let md = `_${content.quoteText}_`;
                        if (content.quoteAuthor != '')
                           md += `\n     @via *${content.quoteAuthor}*`;
                        else
                           md += `\n     @via *Someone unknow*`;
                        bot.sendMessage(chatId, md, { parse_mode: "Markdown"});
                        previous = content;
                     }
                     else i--;
                  }
               });
               t++
               if (t == 50)
               console.warn("WARN: t = " + t);
            }
         }, 3300 + Math.random(0, 1000));
      }
   } catch (e) {
      bot.sendMessage(chatId, res + ' - не похоже на целое число,\n код ошибки:' + e);
   }
});

bot.onText(/\/sticker (.+)/, (msg, match) => {
   const chatId = msg.chat.id;
   const res = match[1];
   Sticker.find({}).then(items => {
      const stickers = items.filter(item => item.emoji === query.data);
      const rand = Math.random(0, )
      bot.sendSticker(chatId, stickers.length);
      const sticker = stickers[rand];
   }).catch(err => console.error('ERROR: ' + err));
});

bot.on('message', (msg) => {
   // ID чата, из которого получено сообщение
   const chatId = msg.chat.id;
   // if (data.ancors.spam === true) {
   //    data.ancors.spam = false;
   //    setTimeout(() => {
   //       for (let i = 0; i < data.spam_count; i++)
   //          bot.sendMessage(chatId, msg.text);
   //    }, 3300 + Math.random(0, 1000));
   if (msg.sticker) {
      // Добавляем в нашу базу полученый стикер
      Sticker.create({
         file_id: msg.sticker.file_id,
         emoji: msg.sticker.emoji
      });
   } else {
      switch (msg.text) {
         case "курс валют":
         case "/curse":
            bot.sendMessage(chatId, 'Выберите валюту:', {
               reply_markup: {
                  inline_keyboard: [
                     [{
                           text: "€ - EUR",
                           callback_data: "EUR"
                        },
                        {
                           text: "$ - USD",
                           callback_data: "USD"
                        },
                        {
                           text: "₽ - RUR",
                           callback_data: "RUR"
                        },
                        {
                           text: "₿ - BTC",
                           callback_data: "BTC"
                        }
                     ]
                  ]
               }
            });
            break;
      }
   }
});

bot.on('callback_query', (query) => {
   const id = query.message.chat.id;
   ExchangeRate.find({}).then(items => {
      const result = items.filter(item => item.ccy === query.data)[0];
      let md = `
         *${result.ccy} 💱 ${result.base_ccy}*
         Buy:  _${result.buy}_
         Sale: _${result.sale}_
         `;
      bot.sendMessage(id, md, {
         parse_mode: 'Markdown'
      });
   }).catch(err => console.error('ERROR: ' + err));
});

