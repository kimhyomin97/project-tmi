const express = require('express');
const app = express();
const cors = require('cors');

// // server test
// const path = require('path');
// app.use(express.static(path.join(__dirname, '../build')));

// app.get('/', (res, req)=>{
//     req.sendFile(path.join(__dirname, '../build/index.html'));
// }) // server에서 html파일을 static하게 뿌려주고 싶으면 다음과 같이 사용하면 된다.
// //

app.use(express.json());
app.use(cors());

const PORT = 5000;

// require('dotenv').config({ path: "../.env"});
require('dotenv').config();

app.listen(PORT, () => {
    console.log(`SERVER ON : http://localhost:${PORT}/`);
})

var request = require('request');
var client_id = process.env.NAVER_TREND_API_CLIENT_ID;
var client_secret = process.env.NAVER_TREND_API_CLIENT_SECRET;
// var client_id = '%REACT_APP_NAVER_TREND_API_CLIENT_ID%';
// var client_secret = 'REACT_APP_NAVER_TREND_API_CLIENT_SECRET';
var api_url = 'https://openapi.naver.com/v1/datalab/search';

const food_api_url = 'https://api.odcloud.kr/api/15035732/v1/uddi:ba47232a-68fb-4252-93e8-fef2699919cc_201909091317?';
const food_api_key = process.env.FOOD_API_KEY_DECODING;

app.get('/foodlist', async (req, res) => {
    // 이부분 async await로 비동기 처리를 해줘야 된다
    // 그 다음 푸드리스트를 불러오는 부분 함수화해서 model 폴더에 구현해주자
    let page=1;
    let perPage=100;
    let offset;
    const req_url = food_api_url+'page='+page+'&perPage='+perPage+'&serviceKey='+food_api_key;
    // request(food_api_url+'serviceKey='+food_api_key, (error, respond, body) => {
    request(req_url, (error, respond, body) => {
        if(error) console.log(error);
        var obj = JSON.parse(body)
        console.log(obj);
        offset = obj.totalCount;
        res.send(obj)
    })
    .then(() => {
        page++;
        console.log(page+" and "+offset);
    })
    
})


app.get('/api/trend', (req, res) => {
    console.log("TEST");
    // 네이버 검색어 트렌드 api 공부
    // var request_body = {
    //     "startDate": "2019-01-01",
    //     "endDate": "2019-04-30",
    //     "timeUnit": "date",
    //     "keywordGroups": [
    //         {"groupName":"타다", "keywords":["타다", "소카", "vcnc", "VCNC"]},
    //     ],
    //     // "keywordGroups": [
    //     //     {
    //     //         "groupName": "한글",
    //     //         "keywords": [
    //     //             "한글",
    //     //             "korean"
    //     //         ]
    //     //     },
    //     //     {
    //     //         "groupName": "영어",
    //     //         "keywords": [
    //     //             "영어",
    //     //             "english"
    //     //         ]
    //     //     }
    //     // ],
    //     // "device": "pc",
    //     // "ages": [
    //     //     "1",
    //     //     "2"
    //     // ],
    //     // "gender": "f"
    // };
    // request.post({
    //         url: api_url,
    //         body: JSON.stringify(request_body),
    //         headers: {
    //             'X-Naver-Client-Id': client_id,
    //             'X-Naver-Client-Secret': client_secret,
    //             'Content-Type': 'application/json'
    //         }
    //     },
    //     function (error, response, body) {
    //         // console.log(response.statusCode);
    //         // console.log(body);
    //         // console.log(response);
    //         res.send(response);
    //     });
})

var open_api_url = "http://aiopen.etri.re.kr:8000/WiseNLU";
var ai_key = process.env.AI_API_KEY;

app.get('/api/word', (req, res) => {
    // var analysis_code = 'morp';
    // // var text = "윤동주(尹東柱, 1917년 12월 30일 ~ 1945년 2월 16일)는 한국의 독립운동가, 시인, 작가이다." +
    // //         "중국 만저우 지방 지린 성 연변 용정에서 출생하여 명동학교에서 수학하였고, 숭실중학교와 연희전문학교를 졸업하였다. 숭실중학교 때 처음 시를 발표하였고, 1939년 연희전문 2학년 재학 중 소년(少年) 지에 시를 발표하며 정식으로 문단에 데뷔했다." +
    // //         "일본 유학 후 도시샤 대학 재학 중 , 1943년 항일운동을 했다는 혐의로 일본 경찰에 체포되어 후쿠오카 형무소(福岡刑務所)에 투옥, 100여 편의 시를 남기고 27세의 나이에 옥중에서 요절하였다. 사인이 일본의 생체실험이라는 견해가 있고 그의 사후 일본군에 의한 마루타, 생체실험설이 제기되었으나 불확실하다. 사후에 그의 시집 《하늘과 바람과 별과 시》가 출간되었다." +
    // //         "일제 강점기 후반의 양심적 지식인으로 인정받았으며, 그의 시는 일제와 조선총독부에 대한 비판과 자아성찰 등을 소재로 하였다. 그의 친구이자 사촌인 송몽규 역시 독립운동에 가담하려다가 체포되어 일제의 생체 실험으로 의문의 죽음을 맞는다. 1990년대 후반 이후 그의 창씨개명 '히라누마'가 알려져 논란이 일기도 했다. 본명 외에 윤동주(尹童柱), 윤주(尹柱)라는 필명도 사용하였다.";
    // var text = "이것은 테스트 문장입니다. 이 문장을 분석합니다. 웹사이트 테스트";
    // var request_json = {
    //     'access_key' : ai_key,
    //     'argument' : {
    //         'text': text,
    //         'analysis_code': analysis_code
    //     }
    // };
    // var options = {
    //     url: open_api_url,
    //     body: JSON.stringify(request_json),
    //     headers: {'Content-Type' : 'application/json; charset=UTF-8'}
    // };
    // request.post(options, function(error, response, body) {
    //     console.log('responseCode = ' + response.statusCode);
    //     console.log('responseBody = ' + body);
    //     res.send(response);
    // });
})

