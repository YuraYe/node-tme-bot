const request = require('request');
const helper = require('./helper')
const config = require('./config');

class UpdateDB {
   static ExchangeRate(ExchangeRate) {
      request(config.assets.exchange_api, (err, req, body) => {
         if (err) throw err;
         else {
            const content = JSON.parse(body);
            console.log('Checking exchange rate...');
            let isNotEmpty = false;
            ExchangeRate.find({}).then(items => {
               if (helper.isNotEmpty(items))
                  isNotEmpty = true;
            });
            for (let i = 0; i < content.length; i++) {
               let {
                  ccy,
                  base_ccy,
                  buy,
                  sale
               } = content[i];
               buy = (parseInt(+buy * 100)) / 100;
               sale = (parseInt(+sale * 100)) / 100;
               if (isNotEmpty) {
                  console.log('case 1')
                  ExchangeRate.updateMany({
                     ccy: ccy,
                     base_ccy: base_ccy,
                     buy: buy,
                     sale: sale
                  });
               } else {
                  console.log('case 2')
                  ExchangeRate.create({
                     ccy: ccy,
                     base_ccy: base_ccy,
                     buy: buy,
                     sale: sale
                  });
               }
            }
         }
      });
   }
}

module.exports = (ExchangeRate) => {
   let i = 1;
   console.log('Running updater...');
   setTimeout(() => {
      console.log(i.toString() + ' Updating data... ');
      UpdateDB.ExchangeRate(ExchangeRate);
      i++;
   }, 36000 + Math.random(0, 10000));
};
