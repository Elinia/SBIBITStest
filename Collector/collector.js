const https = require('https');
const exchange = require('../exchange');

// pairs supported
const currency_pairs = [
    'btcusd', 'btceur', 'eurusd', 'xrpusd', 'xrpeur', 'xrpbtc',
    'ltcusd', 'ltceur', 'ltcbtc', 'ethusd', 'etheur', 'ethbtc',
    'bchusd', 'bcheur', 'bchbtc'
];

/**
 * example:
 * reqs = [
 *     {pair: 'btc_usd', url: 'https://www.bitstamp.net/api/v2/transactions/btcusd/?time=minute'},
 *     {pair: 'btc_eur', url: 'https://www.bitstamp.net/api/v2/transactions/btceur/?time=minute'},
 *      ...
 * ];
 */
const reqs = currency_pairs.map(pair => ({
    pair: `${pair.slice(0, 3)}_${pair.slice(3)}`, // 'btcusd' => 'btc_usd'
    url: `https://www.bitstamp.net/api/v2/transactions/${pair}/?time=minute`
}));

function getData() {
    // send requirements
    let responses = reqs.map(req => new Promise(function(resolve, reject) {
        https.get(req.url, (resp) => {
            let data = '';
            resp.on('data', chunk => data += chunk);
            resp.on('end', () => {
                resolve({
                    pair: req.pair,
                    data: JSON.parse(data)
                });
            });
        }).on('error', (err) => {
            reject(err.message);
        });
    }));

    // get responses and store them to the database
    Promise.all(responses)
    .then(resps => {
        for (let resp of resps) {
            /*if (resp === undefined) {
                continue;
            }*/
            for (let record of resp.data) {
                /*if (record === undefined) {
                    continue;
                }*/
                let entry = {
                    datetime: new Date(parseInt(record.date) * 1000),
                    pair: resp.pair,
                    price: record.price
                };
                exchange.store(entry);
            }
            console.log(resp.data[0]);
        }
    })
    .catch(err => {
        console.error(err);
    });
}

// get data each minute
setInterval(getData, 60000);