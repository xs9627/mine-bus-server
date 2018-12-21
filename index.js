const express = require('express');
const app = express();

const https = require('https');

app.get('/api/v1/busTime/:lineNo-:dirc-:staNo', (req, res) => {
    const {lineNo, dirc, staNo} = req.params;
    getTime(lineNo, dirc, staNo, data => {
        res.status(200).send({
            success: 'true',
            message: data
        })
    })
    
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});


const request_options = {
    host: 'www.xajtfb.cn',
    headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Mobile Safari/537.36 Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; Chitanda/Akari) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 MicroMessenger/6.0.0.58_r884092.501 NetType/WIFI',
        'referer': 'https://www.xajtfb.cn/www/dist/index.html?showFav=0&hideFooter=1&src=webapp_xiantraffic&utm_source=webapp_xiantraffic&utm_medium=entrance&cityId=076&cityName=%e5%ae%89&homePage=around&supportSubway=1&switchCity=0&lng=&lat=undefined&src=webapp_xiantraffic'
    },
};

const getTime = (lineNo, dirc, staNo, callback) => {
    request_options.path = `/api/bus/line!lineDetail.action?lineId=020-${lineNo}-${dirc}&direction=1&stationName=&nextStationName=&lineNo=${lineNo}&targetOrder=${staNo}&s=h5&v=3.1.13&src=webapp_xiantraffic&userId=browser_1545095755868&h5Id=browser_1545095755868&sign=1&cityId=076`;
    
    https.get(request_options, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            data = data.replace("**YGKJ", "").replace("YGKJ##", "");
            const jsonData = JSON.parse(data);
            const buses = jsonData.jsonr.data.buses.filter(b => b.travels[0]).sort((a, b) => {
                return a.travels[0].arrivalTime - b.travels[0].arrivalTime
            });
            if(buses.length > 0) {
                const arrivalTime = buses[0].travels[0].arrivalTime;
                console.log(`${lineNo} - ${new Date(arrivalTime).toLocaleString()} - ${((arrivalTime - new Date()) / 1000 / 60).toFixed(2)}`);
                callback(arrivalTime);
            } else {
                console.log(`${lineNo} - No bus`);
                callback(null);
            }
    
        });
    
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

const getStationBuses = staName => {
    
}

// getTime(46, 0, 20);
// getTime(608, 1, 10);
// getTime(286, 0, 21);
// getTime(24, 0, 10);
// getTime(6, 1, 10);