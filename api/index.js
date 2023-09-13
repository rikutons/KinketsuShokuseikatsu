'use strict';

const express = require('express');
const axios = require('axios')
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
    channelSecret: process.env.LINE_SECRET,
    channelAccessToken: process.env.LINE_TOKEN
};

const app = express();

// {array}の中からランダムに{num}個の要素を取り出して配列を返す
function random(array, num) {
  var a = array;
  var t = [];
  var r = [];
  var l = a.length;
  var n = num < l ? num : l;
  while (n-- > 0) {
    var i = Math.random() * l | 0;
    r[n] = t[i] || a[i];
    --l;
    t[i] = t[l] || a[l];
  }
  return r;
}

const angry_location = ['位置情報を送信したら探してあげるよ', '位置情報以外は無視します', '位置情報をいただけると助かります……'];
const not_found = ['近くに開いてる店は無い！残念！', 'この近くには安いところなさそう……', 'そう都合よく店が見つかると思うなよ'];
const recommend = ['この中から決めてください', '見つかったよ～', 'つ ご飯の候補'];
 
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
	// console.log(req.body.event);
  if (event.type !== 'message' || event.message.type !== 'location') {
    const message = random(angry_location, 1);
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: message[0]
    })
  }

  // 緯度
  const lat = event.message.latitude
  // 経度
  const lng = event.message.longitude

  let yelpREST = axios.create({
    baseURL: "https://api.yelp.com/v3/",
    headers: {
      Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      "Content-type": "application/json",
    },
  })

  await yelpREST.get("/businesses/search", {
    params: {
      latitude: lat, // 取得した緯度
      longitude: lng, // 取得した経度
      radius: 1500, // 今回は半径1500m
      price: 1, // 10$以下
      open_now: "true", // 今開いてるお店
      limit: 10, // 最大10件
    },
  })
    .then(function (response) {
      // handle success
      // データがない場合はそれっぽいことを表示する
      if(response.data.total === 0) {
          const message = random(not_found, 1);
          return client.replyMessage(event.replyToken, {
              type: 'text',
              text: message[0]
          })
      }
        // carouselは最大10
        // colums配列にデータを入れていく
        let columns = [];
        for (let item of response.data.businesses) {
          columns.push({
            "thumbnailImageUrl": item.image_url,
            "title": item.alias,
            "text": '⭐️' + item.rating,
            "actions": [{
              "type": "uri",
              "label": "もっと詳しく",
              "uri": item.url
            }]
          });
        }
        let rand_columns = random(columns, 3);
        const message = random(recommend, 1);
        // replyMessageの第二引数を配列にすることで複数メッセージを送信できる
      return client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: message[0]
        },
        {
          type: 'template',
          altText: 'どこ行くか決まった？',
          template: {
              type: 'carousel',
              columns: rand_columns
          }
      }]);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
}

// app.listen(PORT);
// console.log(`Server running at ${PORT}`);
(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
console.log(`Server running at ${PORT}`);
