const line = require('@line/bot-sdk');
const config = {
  channelAccessToken: process.env.TOKEN,
  channelSecret:  process.env.SECRET,
  recruitKey:  process.env.RECRUIT_APIKEY
};
const client = new line.Client(config);
const axios = require("axios").default;

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
  const instance = axios.create({
    baseURL: "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/",
    params:{
      "key" : config.recruitKey,
      "lat" : lat,
      "lng" : lng,
      "format" : "jsonp"
    }
  })
  const res = instance.get();
  res.then((response) => {
    const results = response.data.results;
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
    // client.replyMessage(req.body.events[0].replyToken, message)
  });
};

// (process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
// console.log(`Server running at ${PORT}`);
