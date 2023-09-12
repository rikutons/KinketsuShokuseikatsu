const line = require('@line/bot-sdk');
const config = {
    channelAccessToken: process.env.TOKEN,
    channelSecret:  process.env.SECRET
};
const client = new line.Client(config);

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body.events[0].message.type !== 'location') {
        return client.replyMessage(req.body.events[0].replyToken, {
            type: 'text',
            text: '位置情報を送信してね！'
        })
    }
    else {
        context.res = {
            status: 200,
            body: "Please check the query string in the request body"
        };
    };
    // 緯度
    const lat = req.body.events[0].message.latitude
    // 経度
    const lng = req.body.events[0].message.longitude

    const respon = lat+","+lng

    const message = {
        type: "text",
        text: respon
    }
    client.replyMessage(req.body.events[0].replyToken, message)
    
};
