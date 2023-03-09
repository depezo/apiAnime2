import { DocumentSnapshot } from "firebase-functions/v1/firestore";
import { UserData } from "../user/user_data";

const admin = require('firebase-admin');
const firestore = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

interface Chat {
    id: String
    description: String
    url_img: String
}

export async function getChats(){
    const chats: Chat[] = [];
    try {
        const data = await firestore.collection('chat').get();
        data.forEach((snapshot: DocumentSnapshot)=>{
            const chat = snapshot.data() as Chat;
            chat.id = snapshot.id;
            chats.push(chat);
        });
    } catch (error) {
        console.log(error);
    }
    return chats;
}

export async function sendTypeMessage(message: String, user: UserData,type: String){
    let status = "";
    try {
        await firestore.collection('chat').doc(type).collection('messages').add({
            message: message,
            user: user,
            timestamp: FieldValue.serverTimestamp()
        });
        status = "OK"
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function sendMessage(message: String, user: UserData){
    let status = "";
    try {
        console.log(message);
        await firestore.collection('chat').doc('general').collection('messages').add({
            message: message,
            user: user,
            timestamp: FieldValue.serverTimestamp()
        });
        status = "OK"
    } catch (error) {
        console.log(error);
    }
    return status;
}