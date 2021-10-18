import { useEffect, useState } from "react";
import db from "../../firebase";
import firebase from 'firebase';
import ChatPage from "../ChatPage/ChatPage";

const { kakao } = window;

function DetailPage(props){
    // console.log(props.match.params.foodid);
    const [food, setFood] = useState();
    useEffect(() => {
        db.collection('food')
        .orderBy('name', 'desc')
        .onSnapshot(data => {
            // setMessages(data.docs.map(doc => ({id: doc.id, message: doc.data() })))
            // setFoods(data.docs.map(doc => ({name: doc.name, location: doc.location, price: doc.price, type: doc.type})))
            // setFoods(data.docs.map(doc => ({id: doc.id, data: doc.data() })))
            data.docs.map(item => {
                // console.log(item);
                if(item.id == props.match.params.foodid){
                    // console.log(item.data());
                    setFood({id: item.id, data: item.data() });
                }
            })
        })
    }, [])
    useEffect(() => {
        var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
        var option = { //지도를 생성할 때 필요한 기본 옵션
            center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
            level: 3 //지도의 레벨(확대, 축소 정도)
        };
        option.center = new kakao.maps.LatLng(37.5663795479871, 127.045325760782); // 성동구 마장동으로 위치 변경
        var map = new kakao.maps.Map(container, option); //지도 생성 및 객체 리턴

        var geocoder = new kakao.maps.services.Geocoder();

        var callback = function(result, status){
            if(status === kakao.maps.services.Status.OK){
                // console.log(result[0].y);
                // console.log(result[0].x);
                var markerPosition = new kakao.maps.LatLng(result[0].y, result[0].x);
                // var markerPosition = new kakao.maps.LatLng(37.5663795479871, 127.045325760782);
                var marker = new kakao.maps.Marker({
                    position: markerPosition
                });

                marker.setMap(map);
            }
        };
        
        geocoder.addressSearch('성동구 마장동', callback);
        // 성동구 마장동
        // x: "127.045325760782"
        // y: "37.5663795479871"
    }, [])

    // console.log(food);
    // console.log(food.data);
    return (
        <>
        <div>이름 : {food?.data.name}</div>
        <div>종류 : {food?.data.type}</div>
        <div>가격 : {food?.data.price}</div>
        <div>위치 : {food?.data.location}</div>
        <div>신청하기 버튼</div>
        <br/>
        <div>DetailPage</div>
        <div>데이터베이스에 등록된 음식들 가져와서 뿌려준다</div>
        <div>음식 종류별로 카테고리 만들어서 클릭하면 해당 음식들만 쭉 나오게 하면 좋을듯</div>
        <div>지도에 뿌려주는 방법은 조금 나중에 생각해보자</div>
        <div id="map" style={{width:"600px", height:"400px"}}></div>
        <div>실시간 채팅?</div>
        <a href={`/chat/${food?.data.kakaoid}`}>채팅하기</a>
        {/* 버튼 클릭으로 url을 변경해서 이동하는 방법으로 해야될듯
            + props를 어떻게 넘겨주는지 고민해봐야 된다
        */}
        <p>
            채팅방 입장 버튼 생성<br/>
            kakaoid 조회한 다음 상황에 맞는 채팅 불러오기<br/>
            이때 채팅방에 대한 아이디값을 설정한다?<br/>
            or<br/>
            두사람의 kakaoid를 비교해서 채팅방 로그를 불러온다<br/>
            아래 방법으로 가는데, 거래가 완료되면 채팅을 삭제하는 방법<br/>
            두번의 검색을 수행한다<br/>
            보내는 입장의 카카오아이디에 해당하는 채팅로그를 불러오고<br/>
            그 안에서 상대방의 카카오아이디에 해당하는 채팅로그를 불러와서<br/>
            해당하는 채팅로그들만 화면에 띄워준다<br/>
            그리고, 입력하는 메시지들은 카카오아이디값을 저장한다<br/>
            +<br/>
            애초에 카카오아이디값을 저장할때 보내는사람 + 받는사람으로 저장하면<br/>
            더 빠를것같다<br/>
        </p>
        </>
    )
}

export default DetailPage;