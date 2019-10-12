const mongoose = require('mongoose');
// JSON configurations file with basic values
const mongo_url = require('./config').mongo_url;

module.exports = () => {
    // "Объект обещания"
    return new Promise((resolve, reject) => {
        mongoose.Promise = global.Promise;
        //! Set on FALSE to production!
        mongoose.set('debug', false);

        mongoose.connection
            .on('error', error => reject(error))
            .on('close', () => console.log('DataBase connection closed.'))
            .once('open', () => resolve(mongoose.connections[0]));

        mongoose.connect(mongo_url, { useNewUrlParser: true });
    });
};