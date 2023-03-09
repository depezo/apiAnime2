import { DocumentSnapshot } from "firebase-functions/v1/firestore";

const admin = require('firebase-admin');
const firestore = admin.firestore();

export interface Tag {
    id: String
    description: String
    by_search_count: number
    wallpapers_count: number
}

export async function getTopTags(){
    const tags: Tag[] = [];
    try {
        const docsSnapshot = await firestore.collection('extra_features').doc('wallpapers_base').collection('tags').limit(10).get(); //.orderBy('by_search_count','desc')
        docsSnapshot.forEach((doc: DocumentSnapshot) => {
            tags.push(doc.data() as Tag)
        });
    } catch (error) {
        console.log(error);
    }
    //console.log(tags);
    return tags;
}

export async function getTagsByString(input: String){
    const tags: Tag[] = [];
    try {
        const newInput = input.toLocaleLowerCase().trim();
        const docsSnapshot = await firestore.collection('extra_features').doc('wallpapers_base').collection('tags').where('description','>=',newInput).limit(4).get();
        docsSnapshot.forEach((doc: DocumentSnapshot) => {
            tags.push(doc.data() as Tag)
        });
    } catch (error) {
        console.log(error);
    }
    //console.log(tags);
    return tags;
}