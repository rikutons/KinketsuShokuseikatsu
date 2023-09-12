const express = require("express")
const line = require('@line/bot-sdk');
const config = {
  channelAccessToken: process.env.TOKEN,
  channelSecret:  process.env.SECRET,
  recruitKey:  process.env.RECRUIT_APIKEY
};

const axios = require("axios").default;
const PORT = process.env.PORT || 3000;

// (process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
// console.log(`Server running at ${PORT}`);
const app = express()
app.get('/', (req, res) => res.send('Hello LINE BOT!(GET)')); //ブラウザ確認用(無くても問題ない)
app.post('/webhook', line.middleware(config), (req, res) => {
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result))
      .catch((err) => {
 	    console.error(err);
        res.status(500).end();
      });
});

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.message.type !== 'location') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '位置情報を送信してね！'
    })
  }
  // 緯度
  const lat = event.message.latitude
  // 経度
  const lng = event.message.longitude
  const instance = axios.create({
    baseURL: "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/",
    params:{
      "key" : config.recruitKey,
      "lat" : lat,
      "lng" : lng,
      "format" : "json"
    }
  })
  const res = instance.get();
  res.then((response) => {
    const results = response.data.results;
    console.log(JSON.stringify(response.data));
    console.log(JSON.stringify(results));
    var storeList = []
    // jsonデータをリストに格納
    results.shop.forEach((storeData) => {
      var store = {
        name: storeData.name,
        hotpepper: storeData.urls.pc,
        image: storeData.photo.pc.l
      }
      storeList.push(store);
    })
    const theStore = storeList[Math.floor(Math.random() * storeList.length)];
    const message = {
      type: "text",
      text: theStore.name
    }
    // client.replyMessage(req.body.events[0].replyToken, {type:"text", text:"aaa"})
    return client.replyMessage(event.replyToken, message)
  });
}

(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
console.log(`Server running at ${PORT}`);
