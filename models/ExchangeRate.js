const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ExchangeRateSchema = new Schema({
  ccy: {
    type: String,
    required: true,
  },
  base_ccy: {
    type: String,
    required: true,
  },
  buy: {
    type: Number,
    required: false,
  },
  sale: {
    type: Number,
    required: false,
  }
});

//? use as a json (_id => id)
ExchangeRateSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('exchange-rate', ExchangeRateSchema);