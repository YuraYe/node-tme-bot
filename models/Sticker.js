const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StickerSchema = new Schema({
  file_id: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  }
},{
  timestamps: true    
});

//? use as a json (_id => id)
StickerSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('sticker', StickerSchema);