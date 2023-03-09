import { getUser, User, UserData } from "../user/user_data";
import { TinyAnime } from "./anime_data";

const admin = require('firebase-admin');
var firestore = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

export interface Review {
    id: String
    user: UserData
    description: String
    anime: TinyAnime
    likes: String[]
    datetime: String
    count_likes: number
}

export async function deleteReview(id: String, idUser: String){
    let status = 'FAIL';
    try {
        await firestore.collection('reviews').doc(id).delete();
        await firestore.collection('users').doc(idUser).set({
            count_reviews: FieldValue.increment(-1)
        }, {merge: true});
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function reportReview(id: String, reason: String){
    let status = 'FAIL';
    try {
        const idReport = firestore.collection('reports').doc().id;
        await firestore.collection('reports').doc(idReport).set({
            id: idReport,
            document_id: id,
            reported_datetime: FieldValue.serverTimestamp(),
            reason: reason,
            type_reported: 'review',
            status: 'pending'
        });
        status = 'OK';
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function getReviewsByUser(id: String) {
    let reviews: Review[] = [];
    try {
        console.log("id user", id)
        const snapshot = await firestore.collection('reviews').where('id_user', '==', id).get();
        if (snapshot.empty) return reviews;
        snapshot.forEach((doc: any) => {
            const review: Review = doc.data();
            review.id = doc.id;
            review.datetime = doc.get("timestamp")._seconds.toString()
            reviews.push(review);
        });
        await Promise.all(reviews.map(async (value: any, index: any) => {
            reviews[index].user = await getUser(value.id_user);
        }));
    } catch (error) {
        console.log(error);
    }
    return reviews;
}

export async function getTopReviews() {
    let reviews: Review[] = [];
    try {
        const end = Date.now();
        const start = end - (60 * 60 * 24 * 8 * 1000);
        console.log(start + ' - ' + end);
        const startDate = new Date(start);
        const endDate = new Date(end);
        const data = await firestore.collection('reviews').orderBy('timestamp', 'desc').where('timestamp', '<', endDate).where('timestamp', '>', startDate).orderBy('count_likes', 'desc').limit(10).get();
        data.forEach((doc: any) => {
            const review: Review = doc.data();
            review.id = doc.id;
            review.datetime = doc.get("timestamp")._seconds.toString()
            reviews.push(review);
        });
        const sortedReview: Review[] = reviews.sort((n1, n2) => {
            if (n1.count_likes > n2.count_likes) {
                return -1;
            }

            if (n1.count_likes < n2.count_likes) {
                return 1;
            }

            return 0;
        });
        reviews = sortedReview;
        await Promise.all(reviews.map(async (value: any, index: any) => {
            reviews[index].user = await getUser(value.id_user);
        }));
        //console.log('executing query: ', reviews.length);
    } catch (error) {
        console.log(error);
    }
    return reviews;
}

export async function getBestReviewWeek() {
    let reviews: Review[] = []
    try {
        const data = await firestore.collection('reviews').orderBy('timestamp', 'desc').limit(10).get();
        data.forEach((doc: any) => {
            const review: Review = doc.data();
            review.id = doc.id;
            review.datetime = doc.get("timestamp")._seconds.toString()
            reviews.push(review);
        });
        await Promise.all(reviews.map(async (value: any, index: any) => {
            reviews[index].user = await getUser(value.id_user);
        }));
        //console.log('executing query: ', reviews.length);
    } catch (error) {
        console.log(error);
    }
    return reviews;
}

export async function setLikeReview(idUser: String, type: String, idAnime: number, idReview: String) {
    let status = "";
    try {
        /* Firestore */
        console.log(type, idAnime, idReview, " - ", idUser);
        if (type == "likes") {
            await firestore.collection('reviews').doc(idReview).update({
                likes: FieldValue.arrayUnion(idUser),
                count_likes: FieldValue.increment(1)
            });
        } else {
            await firestore.collection('reviews').doc(idReview).update({
                likes: FieldValue.arrayRemove(idUser),
                count_likes: FieldValue.increment(-1)
            });
        }
        /* Realtime database */
        //await realtime.ref('anime/' + idAnime.toString() + '/comments/' + idComment).child(type).set(likesOrDislikes);
        status = "OK.";
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function getMoreReviewsByAnime(id: number, filter: String, lastId: String) {
    let reviews: Review[] = [];
    try {
        
        const previousSnapshot = await firestore.collection('reviews').doc(filter).get();
        previousSnapshot.data().count_likes = 0;
        if(previousSnapshot.data().count_likes == undefined){
            previousSnapshot.data().count_likes = 0;
        }
        let snapshot;
        if( lastId == 'recent'){
            snapshot = await firestore.collection('reviews').where('anime.id', '==', id.toString()).orderBy('timestamp','desc').startAt(previousSnapshot).limit(10).get();
        }else{
            snapshot = await firestore.collection('reviews')
            .where('anime.id', '==', id.toString())
            .orderBy('count_likes','desc').startAt(previousSnapshot).limit(10).get();
        }
        if (snapshot.empty) return reviews;
        snapshot.forEach((doc: any) => {
            const review: Review = doc.data();
            review.id = doc.id;
            review.datetime = doc.get("timestamp")._seconds.toString()
            reviews.push(review);
        });
        await Promise.all(reviews.map(async (value: any, index: any) => {
            reviews[index].user = await getUser(value.id_user);
        }));
    } catch (error) {
        console.log(error);
    }
    return reviews;
}

export async function getReviewsByAnimeV2(id: number,userId: String, filter: String) {
    let reviews: Review[] = [];
    console.log(id, userId, filter);
    try {
        let snapshot;
        if(userId != undefined && userId != "null"){
            const docSnapshot = await firestore.collection('reviews').where('id_user', '==', userId).where('anime.id', '==', id.toString()).get();
            docSnapshot.forEach((doc: any) => {
                const review: Review = doc.data();
                review.id = doc.id;
                review.datetime = doc.get("timestamp")._seconds.toString()
                reviews.push(review);
            });
        }
        if( filter == 'recent'){
            snapshot = await firestore.collection('reviews').where('anime.id', '==', id.toString()).orderBy('timestamp','desc').limit(10).get();
        }else{
            snapshot = await firestore.collection('reviews')
                .where('anime.id', '==', id.toString())
                .orderBy('count_likes','desc').limit(10).get();
        }
        if (snapshot.empty) return reviews;
        snapshot.forEach((doc: any) => {
            const review: Review = doc.data();
            review.id = doc.id;
            if(doc.data().id_user != userId){
                review.datetime = doc.get("timestamp")._seconds.toString()
                reviews.push(review);
            }            
        });
        await Promise.all(reviews.map(async (value: any, index: any) => {
            reviews[index].user = await getUser(value.id_user);
        }));
    } catch (error) {
        console.log(error);
    }
    return reviews;
}

export async function getReviewsByAnime(id: number) {
    let reviews: Review[] = [];
    try {
        const snapshot = await firestore.collection('reviews').where('anime.id', '==', id.toString()).orderBy('timestamp','desc').get();
        if (snapshot.empty) return reviews;
        snapshot.forEach((doc: any) => {
            const review: Review = doc.data();
            review.id = doc.id;
            review.datetime = doc.get("timestamp")._seconds.toString()
            reviews.push(review);
        });
        await Promise.all(reviews.map(async (value: any, index: any) => {
            reviews[index].user = await getUser(value.id_user);
        }));
    } catch (error) {
        console.log(error);
    }
    return reviews;
}

export async function setReview(id: String, title: String, description: String, anime: TinyAnime) {
    let status = "";
    try {
        await firestore.collection('reviews').add({
            id_user: id,
            title: title,
            description: description,
            anime: anime,
            timestamp: FieldValue.serverTimestamp()
        });
        await firestore.collection('users').doc(id).update({
            count_reviews: FieldValue.increment(1)
        });
        status = "OK";
    } catch (error) {
        console.log(error);
    }
    return status;
}