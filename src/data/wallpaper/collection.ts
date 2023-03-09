import { getCipherInfo } from "crypto";
import { Tag } from "./tag";
import { Wallpaper } from "./wallpaper";

const admin = require('firebase-admin');
const firestore = admin.firestore();
const wallpaperReference = firestore.collection('extra_features').doc('wallpapers_base');
const FieldValue = admin.firestore.FieldValue;

interface Collection {
    id: String,
    title: String,
    likes: String[],
    dislikes: String[],
    banner_wallpapers: Wallpaper[],
    wallpapers: String[],
    wallpapers_count: number,
    by_downloads_count: number,
    by_search_count: number,
    tags: String[],
    user: String
}

export async function getCollectionsByInput(input: String) {
    console.log('emtrandifndifnmdfik')
    const collections: Collection[] = [];
    try {
        const snapshotTag = await wallpaperReference.collection('collections')
            .where('tags', 'array-contains', input.toLowerCase()).limit(5).get();
        snapshotTag.forEach((doc: any) => {
            let isAdded = false;
            for (let item of collections) {
                if (item.id == doc.data().id) {
                    isAdded = true;
                }
            }
            if (!isAdded) {
                collections.push(doc.data());
            }
        });
        const snapshot = await wallpaperReference.collection('collections').where('title', '>=', input).limit(5).get();
        snapshot.forEach((doc: any) => {
            let isAdded = false;
            for (let item of collections) {0
                if (item.id == doc.data().id) {
                    isAdded = true;
                }
            }
            if (!isAdded) {
                collections.push(doc.data());
            }
        });
    } catch (error) {
        console.log(error);
    }
    return collections;
}

export async function getWallpapersOfCollection(wallpaperIds: String[]) {
    const wallpapers: Wallpaper[] = [];
    console.log(wallpaperIds);
    try {
        for (let item of wallpaperIds) {
            const snapshot = await wallpaperReference.collection('wallpapers').doc(item).get();
            wallpapers.push(snapshot.data());
        }
    } catch (error) {
        console.log(error);
    }
    return wallpapers;
}

export async function getSectionCollection(query: String, userId: String) {
    let items: Collection[] = [];
    const params = query.split('#');
    const finishQuery = params[0];
    switch (finishQuery) {
        case "getMostPopularCollections":
            await getMostPopularCollections().then((values: Collection[]) => {
                items = values;
            });
            break;
        case "getCollectionsByTag":
            await getCollectionsByTag(params[1]).then((values: Collection[]) => {
                items = values;
            });
            break;
    }
    return items;
}

async function getCollectionsByTag(tag: String) {
    const wallpapers: Collection[] = [];
    try {
        const snapshot = await wallpaperReference.collection('collections').where('tags', 'array-contains', tag).limit(5).get();
        snapshot.forEach((doc: any) => {
            wallpapers.push(doc.data());
        });
    } catch (error) {
        console.log(error);
    }
    return wallpapers;
}

async function getMostPopularCollections() {
    const collections: Collection[] = [];
    try {
        const snapshot = await wallpaperReference.collection('collections').get();
        snapshot.forEach((doc: any) => {
            collections.push(doc.data());
        });
    } catch (error) {
        console.log(error);
    }
    return collections;
}

export async function publishCollection(collection: Collection) {
    let status = 'FAIL';
    try {
        const collectionId = wallpaperReference.collection('collections').doc().id;
        for (let i = 0; i < collection.tags.length; i++) {
            const tagName = collection.tags[i].toLowerCase().trim();
            collection.tags[i] = tagName;
            await wallpaperReference.collection('tags').doc(tagName).set({
                collection_count: FieldValue.increment(1),
                description: tagName,
                id: tagName
            }, { merge: true })
        }
        collection.id = collectionId;
        collection.by_search_count = 0;
        collection.by_downloads_count = 0;
        await wallpaperReference.collection('collections').doc(collectionId).set(collection);
        status = 'OK';
    } catch (error) {
        console.log(error);
    }
    console.log(status)
    return status;
}