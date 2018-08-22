const mongoose = require('mongoose');

const db = mongoose.createConnection('mongodb://localhost:27017/ticker');

const ExchangeSchema = new mongoose.Schema({
    'datetime': Date,
    'pair': String,
    'price': Number
});

const Exchange = db.model('Exchange', ExchangeSchema);

module.exports = {
    store: (data) => {
        let exchange = new Exchange(data);
        exchange.save((err, data) => {
        	if (err) {
        		console.log(err);
        	}
        });
    },
    load: (where, callback) => {
        return Exchange.find(where, (err, data) => {
        	if (err) {
        		console.log(err);
        	} else {
        		callback(data);
        	}
        });
    },
    list: () => {
    	return Exchange.find();
    }
};