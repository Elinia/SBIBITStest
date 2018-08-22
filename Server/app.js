const express = require('express');
const exchange = require('../exchange');
const app = express();

app.get('/', (req, res, next) => {
    //console.log('GET /');
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/query', (req, res, next) => {
    //console.log('GET /query');
    //console.log(req.query);
    exchange.load(req.query, (data) => {
        res.json(reformat(data));
    });
});

app.listen(80, () => {});

app.use(express.static('public'));

// {datetime: Date, pair: xrp_jpy, price: 50.1}*M to {datetime: xxxx-xx-xx xx:xx, pair: xrp_jpy, price_between_max_min: 1.1}*N
function reformat(data) {
    if (data.length <= 0) {
        return [];
    }
    let map = [];
    let result = [];
    for (let entry of data) {
        let year = zeroCompleting(entry.datetime.getFullYear(), 4);
        let month = zeroCompleting(entry.datetime.getMonth() + 1, 2);
        let date = zeroCompleting(entry.datetime.getDate(), 2);
        let hours = zeroCompleting(entry.datetime.getHours(), 2);
        let minutes = zeroCompleting(entry.datetime.getMinutes(), 2);
        let time = `${year}-${month}-${date} ${hours}:${minutes}`; // 'yyyy-mm-dd hh:mm'
        if (map[entry.pair] === undefined) {
            map[entry.pair] = [];
        }
        if (map[entry.pair][time] === undefined) {
            map[entry.pair][time] = {
                'max': entry.price,
                'min': entry.price
            };
        } else {
            if (map[entry.pair][time].max < entry.price) {
                map[entry.pair][time].max = entry.price;
            }
            if (map[entry.pair][time].min > entry.price) {
                map[entry.pair][time].min = entry.price;
            }
        }
    }
    for (let pair in map) {
        for (let time in map[pair]) {
            result.push({
                'datetime': time,
                'pair': pair,
                'price_between_max_min': (map[pair][time].max - map[pair][time].min).toFixed(2)
            });
        }
    }
    return result.sort((a, b) => {
        if (a.datetime < b.datetime) {
            return 1;
        }
        if (a.datetime > b.datetime) {
            return -1;
        }
        return 0;
    });
}

function zeroCompleting(value, bits) {
    let result = Array(bits + 1).join('0') + value;
    return result.slice(-bits);
}