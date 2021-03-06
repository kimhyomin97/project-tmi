import {forwardRef, useEffect, useState } from "react";
import db from "../../firebase";
import firebase from 'firebase';
import { FormControl, Button, Input, InputLabel, Card, CardContent, Typography} from '@material-ui/core';


function ChatPage(props){

    const [myid, setMyid] = useState();
    
    useEffect(() => {
        window.Kakao.API.request({
            url: '/v2/user/me',
            success: function(res){
                setMyid(res.id);
            }
        })
    }, []);

    const [sender, setSender] = useState();
    const [receiver, setReceiver] = useState();

    useEffect(() => {
        window.Kakao.API.request({
            url: '/v2/user/me',
            success: function(res){
                setSender(String(res.id));
                props.match.params.hostid.split('+').map(item => {
                    if(item != String(res.id)) setReceiver(String(item));
                })
            }
        })
    }, []);

    const [receiver_nickname, setReceiver_nickname] = useState();
    useEffect(() => {
        db.collection('login')
            .where('kakaoid', '==', String(receiver))
            .onSnapshot((res) => {
                setReceiver_nickname(res.docs[0]?.data().nickname);
            })
    }, [receiver])

    const [sendermsg, setSendermsg] = useState([]);
    const [receivermsg, setReceivermsg] = useState([]);
    const [mergemsg, setMergemsg] = useState([]);
    const [allmessage, setAllmessage] = useState([]);

    useEffect(() => {
        db.collection('messages')
            .where('sender', '==', String(sender))
            .where('receiver', '==', String(receiver))
            .onSnapshot((res) => {
                setSendermsg(res.docs.map(doc => ({id: doc.data().sender, message: doc.data().message, timestamp: doc.data().timestamp })));
            })
        db.collection('messages')
        .where('sender', '==', String(receiver))
        .where('receiver', '==', String(sender))
        .onSnapshot((res) => {
            setReceivermsg(res.docs.map(doc => ({id: doc.data().sender, message: doc.data().message, timestamp: doc.data().timestamp })));
        })
    }, [receiver])
    useEffect(() => {
        // ????????? ??????
        setMergemsg(mergemsg => [...sendermsg, ...receivermsg]);
    }, [receivermsg])

    
    useEffect(() => {
        // ????????? ??????
        var temparr = [...mergemsg];
        temparr = temparr.sort(function (a, b){
            return a.timestamp.seconds - b.timestamp.seconds;
        });
        setAllmessage(temparr);
    }, [mergemsg])

    // ????????? ??????
    const [input, setInput] = useState("");
    const sendMessage = (e) => {
        e.preventDefault();
        db.collection('messages').add({
            message: input,
            sender: sender,
            receiver: receiver,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        // ????????? ????????? ??????
        setAllmessage(allmessage => [...allmessage, ({ message: input, sender: sender, receiver: receiver, timestamp: firebase.firestore.FieldValue.serverTimestamp() })])
        // ????????? ????????? ??????
        setInput("");
    }

    const Message = forwardRef(({username, message }, ref) => {
        // ????????? ????????????
        const isUser = username == myid;
        return (
            <div ref={ref} className={!isUser ? "chat_message_receiver" : "chat_message_sender"}>
                <Card className = {"msg_user_card"}>
                    <CardContent>
                        <Typography color="white" variant="h5" component="h2" >
                            {/* {!isUser ? '?????????' : '?????????'} : {message} */}
                            {message}
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        )
    })

    return(
        <>
        <div className="message_title">{receiver_nickname}????????? ??????</div>
        <hr/>
        <div className="message_wrapper">
            {
                allmessage.map(({id, message}) => (
                    <Message key={id} username={id} message={message} />
                ))
            }
        </div>
        <form className="app_from">
            <FormControl className="message_input">
                <div>
                    <InputLabel> ???????????? ???????????????.</InputLabel>
                    <Input style={{width: "50vw"}} value={input} onChange={e => {setInput(e.target.value)}} />
                    <Button style={{margin:"0 0 0 10px"}} disabled = {!input} variant="contained" color="primary" type="submit" onClick={sendMessage} >
                        ??????
                    </Button>
                </div>
            </FormControl>
        </form>
        </>
    )
}

export default ChatPage;