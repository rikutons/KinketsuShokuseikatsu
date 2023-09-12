const line = require('@line/bot-sdk');
const config = {
    channelAccessToken: process.env.TOKEN,
    channelSecret:  process.env.SECRET
};
const client = new line.Client(config);

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.message || (req.body && req.body.events)) {
        if (req.body && req.body.events[0]) {
            message = {
                type: "text",
                text: req.body.events[0].message.text
            }
            console.log(message);
            if (req.body.events[0].replyToken) {
                client.replyMessage(req.body.events[0].replyToken, message);
            }
        }
        else {
            context.res = {
                status: 200,
                body: req.query.message
            };
        }
    }
    else {
        context.res = {
            status: 200,
            body: "Please check the query string in the request body"
        };
    };
};
