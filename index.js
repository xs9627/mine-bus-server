const express = require('express');
const app = express();

const https = require('https');

app.get('/api/v1/busTime/:lineNo-:dirc-:staNo', (req, res) => {
    const {lineNo, dirc, staNo} = req.params;
    getTime(lineNo, dirc, staNo).then( data => {
        res.status(200).send({
            success: 'true',
            message: data
        })
    })
});

app.get('/api/v1/stationBuses/:staName', (req, res) => {
    const {staName} = req.params;
    getStationBuses(staName).then(data => {
        res.status(200).send({
            success: 'true',
            message: data
        })
    });
});

app.get('/api/v1/busInfo/:lineId', (req, res) => {
    const {lineId} = req.params;
    getBusInfo(lineId).then(data => {
        res.status(200).send({
            success: 'true',
            message: data
        })
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

const getTime = async (lineNo, dirc, staNo) => {
    const request_options = {
        host: 'www.xajtfb.cn',
        headers: {
            'referer': 'https://www.xajtfb.cn/www/dist/index.html?showFav=0&hideFooter=1&src=webapp_xiantraffic&utm_source=webapp_xiantraffic&utm_medium=entrance&cityId=076&cityName=%e5%ae%89&homePage=around&supportSubway=1&switchCity=0&lng=&lat=undefined&src=webapp_xiantraffic'
        },
        path: `/api/bus/line!lineDetail.action?lineId=020-${lineNo}-${dirc}&direction=1&stationName=&nextStationName=&lineNo=${lineNo}&targetOrder=${staNo}&s=h5&v=3.1.13&src=webapp_xiantraffic&userId=browser_1545095755868&h5Id=browser_1545095755868&sign=1&cityId=076`
    };
    const result = await httpsGet(request_options);
    const data = result.replace("**YGKJ", "").replace("YGKJ##", "");
    const jsonData = JSON.parse(data);
    const buses = jsonData.jsonr.data.buses.filter(b => b.travels[0]).sort((a, b) => {
        return a.travels[0].arrivalTime - b.travels[0].arrivalTime;
    });
    if (buses.length > 0) {
        const arrivalTime = buses[0].travels[0].arrivalTime;
        console.log(`${lineNo} - ${new Date(arrivalTime).toLocaleString()} - ${((arrivalTime - new Date()) / 1000 / 60).toFixed(2)}`);
        return arrivalTime;
    }
    else {
        console.log(`${lineNo} - No bus`);
    }
}

const getStationBuses = staName => {
    const request_options = {
        host: 'www.xajtfb.cn',
        path: `/Bus/GetMergeStationByName?sname=${encodeURIComponent(staName)}`
    };
    return httpsGet(request_options);
}

const getBusInfo = lineId => {
    const request_options = {
        host: 'www.xajtfb.cn',
        path: `/Bus/GetBusLineById?routeId=${lineId}`
    };
    return httpsGet(request_options);
}

const httpsGet = requestOption => {
    return new Promise((resolve, reject) => {
        https.get(requestOption, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                resolve(data);
            });
        }).on("error", (err) => {
            reject("Error: " + err.message);
        });
    });
}

// getTime(46, 0, 20);
// getTime(608, 1, 10);
// getTime(286, 0, 21);
// getTime(24, 0, 10);
// getTime(6, 1, 10);