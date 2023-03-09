import { DocumentSnapshot } from "firebase-functions/v1/firestore";
import { Anime } from "../anime/anime_data";

const admin = require('firebase-admin');
const firestore = admin.firestore();
const realtime = admin.database();
const FieldValue = admin.firestore.FieldValue;

const DEFAULT_URL_PHOTO = "https://firebasestorage.googleapis.com/v0/b/animeapp-a8b2c.appspot.com/o/img_perfil%2Fnagatoro.jpg?alt=media&token=555f2803-8e81-4ea7-8df8-bb2a4854582c";

export interface User {
    id: String
    username: String
    email: String
    url_photo: String
}

export interface UserData {
    id: String
    username: String
    url_photo: String
    url_gif: String
    count_anime: number
    count_episodes: number
    count_reviews: number
    rol: Rol
}

interface Rol {
    description: String
    color: String
    selectable: Boolean
}

interface EpisodesW {
    episodes: number[]
    isFinished: Boolean
}

interface TypeImage {
    id: String
    description: String
    url_img: String
    images: String[]
}

export async function getTypeImages(){
    const types: TypeImage[] = [];
    try {
        const data = await firestore.collection('img_profile').get();
        data.forEach((doc: any) => {
            const type: TypeImage = doc.data();
            type.id = doc.id;
            types.push(type);
        });
    } catch (error) {
        console.log(error);
    }
    return types;
}

export async function setFinishedAnime(id: String, idAnime: number) {
    let status = "";
    try {
        await firestore.collection('users').doc(id).collection('episodes_watched').doc(idAnime.toString()).update({
            isFinished: true
        });
        await firestore.collection('users').doc(id).update({
            count_anime: FieldValue.increment(1)
        });
        status = "OK";
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function updateRol(id: String, rol: Rol) {
    let status = "";
    try {
        await firestore.collection('users').doc(id).set({
            rol: rol
        }, { merge: true });
        status = "OK";
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function getRoles() {
    const roles: Rol[] = [];
    try {
        const data = await firestore.collection('roles').get();
        data.forEach((value: any) => {
            roles.push(value.data());
        });
    } catch (error) {
        console.log(error);
    }
    return roles;
}

export async function getUserData(id: String) {
    let user = {} as UserData
    try {
        const data = await firestore.collection("users").doc(id).get();
        user = data.data();
        await firestore.collection("users").doc(id).collection('episodes_watched');
    } catch (error) {
        console.log(error);
    }
}

export async function setLastViewed(id: String, add: Anime, removeId: String, withRemoved: Boolean) {
    let status = "";
    try {
        console.log("data: ", id);
        console.log("data: ", add.id);
        console.log("data: ", withRemoved);
        console.log("data: ", removeId);
        if (withRemoved) {
            await firestore.collection('users').doc(id).collection('last_anime').doc(removeId).delete();
            await firestore.collection('users').doc(id).collection('last_anime').add({
                id: add.id,
                title: add.title,
                synopsis: add.synopsis,
                episodes: add.episodes,
                score: add.score,
                type: add.type,
                url_img: add.url_img,
                datetime: FieldValue.serverTimestamp()
            });
        } else {
            await firestore.collection('users').doc(id).collection('last_anime').add({
                id: add.id,
                title: add.title,
                synopsis: add.synopsis,
                episodes: add.episodes,
                score: add.score,
                type: add.type,
                url_img: add.url_img,
                datetime: FieldValue.serverTimestamp()
            });
        }
        status = "OK";
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function updateAnimesFav(id: String, anime: Anime, type: String) {
    let status = "";
    try {
        //console.log(type, anime.id);
        if (type == "add") {
            await firestore.collection('users').doc(id).collection('animes_fav').doc(anime.id.toString()).set({
                id: anime.id,
                title: anime.title,
                synopsis: anime.synopsis,
                episodes: anime.episodes,
                score: anime.score,
                type: anime.type,
                url_img: anime.url_img
            });
        } else {
            await firestore.collection('users').doc(id).collection('animes_fav').doc(anime.id.toString()).delete();
        }
        status = "OK";
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function getAnimesFav(id: String) {
    var animes: Anime[] = [];
    try {
        const data = await firestore.collection('users').doc(id).collection('animes_fav').get();
        data.forEach((value: any) => {
            animes.push(value.data());
            //console.log(value.get('synopsis'));
        });
    } catch (error) {
        console.log(error);
    }
    return animes;
}

export async function updatePhoto(id: String, newPhoto: String) {
    let status = "";
    try {
        await firestore.collection('users').doc(id).set({
            url_photo: newPhoto
        }, { merge: true });
        /* Realtime */
        /*await realtime.ref('users/' + id + '/url_photo').set(newPhoto);
        status = "OK";*/
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function updateGif(id: String, newGif: String) {
    let status = "";
    try {
        await firestore.collection('users').doc(id).set({
            url_gif: newGif
        }, { merge: true });
        /* Realtime */
        /*await realtime.ref('users/' + id + '/url_photo').set(newPhoto);
        status = "OK";*/
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function updateUsername(id: String, username: String) {
    let status = "";
    try {
        await firestore.collection('users').doc(id).set({
            username: username
        }, { merge: true });
        /* Realtime */
        /*await realtime.ref('users/' + id + '/username').set(username);*/
        status = "OK";
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function setEpisodesW(id: String, idAnime: number, ew: number) {
    let status = "";
    try {
        /* Firestore */
        await firestore.collection('users').doc(id).collection('episodes_watched').doc(idAnime.toString()).set({
            episodes: FieldValue.arrayUnion(ew),
            isFinished: false
        }, { merge: true });
        await firestore.collection('users').doc(id).update({
            count_episodes: FieldValue.increment(1)
        });
        /* Realtime */
        //await realtime.ref('users/'+id+'/episodes_watched/'+idAnime.toString()).set(ew);
        status = "OK";
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function getEpisodesW(id: String, idAnime: number) {
    let episodes_watched = {} as EpisodesW;
    try {
        /* Firestore */
        const snapshot = await firestore.collection('users').doc(id).collection('episodes_watched').doc(idAnime.toString()).get();
        episodes_watched = snapshot.data();
        /* Realtime */
        /*await realtime.ref('users/'+id+'/episodes_watched/'+idAnime.toString()).once('value', (data:any) => {
            ew = data.val();
            console.log(ew);
        });*/
    } catch (error) {
        console.log(error);
    }
    return episodes_watched;
}

export async function createUser(email: String, id: String) {
    let status = "";
    try {
        /* Firestore */
        await firestore.collection('users').doc(id).set({
            email: email,
            username: email.split('@')[0],
            url_photo: DEFAULT_URL_PHOTO,
            count_episodes: 0,
            count_anime: 0,
            count_reviews: 0
        });
        /* Realtime database */
        /*await realtime.ref('users/' + id).set({
            email: email,
            username: email.split('@')[0],
            url_photo: DEFAULT_URL_PHOTO
        });*/
        console.log(email);
        status = "OK";
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function getUser(id: String) {
    /* Firestore */
    let user = {} as UserData;
    try {
        const data = await firestore.collection('users').doc(id).get();
        user = data.data();
        user.id = id;
        /* Realtime Database */
        //let user = {} as User;
        /*await realtime.ref('users/' + id ).once('value', (data:any) => {
            user = data.val();
        });*/
        //user.id = id;
    } catch (e) {
        console.log(e);
    }
    if(user == null){
        user = {} as UserData;
        user.id = id;
        user.username = 'Sin configurar';
        user.url_photo = 'https://firebasestorage.googleapis.com/v0/b/animeapp-a8b2c.appspot.com/o/img_perfil%2Fasta.jpg?alt=media&token=698fb5f9-7d4b-49d3-bd55-7ec184d7f4bf';
        user.count_anime = 0;
        user.count_episodes = 0;
        user.count_reviews = 0;
        user.rol = {
            color: '#5c007a',
            description: 'Anonimo',
            selectable: true,
        };
        user.url_gif = 'https://media.tenor.com/images/ac267306ab652baa385d1021e37d5627/tenor.gif';
    }
    return user;
}
