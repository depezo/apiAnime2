import { DocumentSnapshot } from "firebase-functions/v1/firestore";
import { getUser, getUserData, UserData } from "../user/user_data";
import { Tag } from "./tag";

const admin = require('firebase-admin');
const firestore = admin.firestore();
const wallpaperReference = firestore.collection('extra_features').doc('wallpapers_base');
const FieldValue = admin.firestore.FieldValue;

export interface Wallpaper {
    id: String,
    title: String,
    url_img: String,
    url_storage: String,
    likes: String[],
    dislikes: String[],
    tags: String[],
    user: String,
    by_search_count: number,
    by_downloads_count: number,
    collections: String[],
    width: number,
    height: number,
    typeResolution: TypeResolution,
    status: String
}

enum TypeResolution {
    HD,
    FHD,
    QHD,
    UHD
}

interface Section {
    description: String,
    position: number,
    type: String,
    query: String
}

export async function approveWallpaper(idWallpaper: String, status: String, tags: String[]) {
    let statusF = 'FAIL';
    try {
        if (status == 'approved') {
            for (let i = 0; i < tags.length; i++) {
                const tagName = tags[i].toLowerCase().trim();
                await wallpaperReference.collection('tags').doc(tagName).set({
                    wallpaper_count: FieldValue.increment(1),
                    description: tagName,
                    id: tagName
                }, { merge: true })
            }
        }
        await wallpaperReference.collection('wallpapers').doc(idWallpaper).update({
            status: status,
            updated_status_datetime: FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.log(error);
    }
    return statusF;
}

export async function getForCheckWallpapers() {
    const wallpapers: Wallpaper[] = [];
    try {
        const snapshot = await wallpaperReference.collection('wallpapers').where('status', '==', 'pending').limit(10).get();
        snapshot.forEach((doc: any) => {
            wallpapers.push(doc.data());
        });
    } catch (error) {
        console.log(error);
    }
    return wallpapers;
}

export async function getWallpaperByInput(input: String) {
    const wallpapers: Wallpaper[] = [];
    try {
        const snapshotTag = await wallpaperReference.collection('wallpapers')
            .where('tags', 'array-contains', input.toLowerCase()).where('status', '==', 'approved').limit(10).get();
        snapshotTag.forEach((doc: any) => {
            let isAdded = false;
            for (let item of wallpapers) {
                if (item.id == doc.data().id) {
                    isAdded = true;
                }
            }
            if (!isAdded) {
                wallpapers.push(doc.data());
            }
        });
        const snapshot = await wallpaperReference.collection('wallpapers').where('status', '==', 'approved').where('title', '>=', input).limit(10).get();
        snapshot.forEach((doc: any) => {
            let isAdded = false;
            for (let item of wallpapers) {
                if (item.id == doc.data().id) {
                    isAdded = true;
                }
            }
            if (!isAdded) {
                wallpapers.push(doc.data());
            }
        });
    } catch (error) {
        console.log(error);
    }
    return wallpapers;
}

export async function getMostSearchedWallpapers() {
    const wallpapers: Wallpaper[] = [];
    try {
        const snapshot = await wallpaperReference.collection('wallpapers').where('status', '==', 'approved').orderBy('by_search_count', 'desc').limit(10).get();
        snapshot.forEach((doc: any) => {
            wallpapers.push(doc.data());
        })
    } catch (error) {
        console.log(error);
    }
    return wallpapers;
}

export async function incrementDownloadCount(wallpaperId: String) {
    let status = 'FAIL';
    try {
        await wallpaperReference.collection('wallpapers').doc(wallpaperId).update({
            by_downloads_count: FieldValue.increment(1)
        });
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function setLikeOrDislikeWallpaper(docId: String, userId: String, type: String, isRemoving: boolean, reference: String) {
    let status = 'FAIL';
    try {
        const update = wallpaperReference.collection(reference).doc(docId);
        if (type == 'like') {
            if (isRemoving) {
                await update.update({
                    likes: FieldValue.arrayRemove(userId),
                    rating: FieldValue.increment(-1)
                });
            } else {
                await update.update({
                    likes: FieldValue.arrayUnion(userId),
                    dislikes: FieldValue.arrayRemove(userId),
                    rating: FieldValue.increment(2)
                });
            }
        } else {
            if (isRemoving) {
                await update.update({
                    dislikes: FieldValue.arrayRemove(userId),
                    rating: FieldValue.increment(1)
                });
            } else {
                await update.update({
                    dislikes: FieldValue.arrayUnion(userId),
                    likes: FieldValue.arrayRemove(userId),
                    rating: FieldValue.increment(-2)
                });
            }
        }
        status = 'OK'
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function getUserAndSections(userId: String, tags: String[], isComingFrom: String) {
    let response = {};
    try {
        const sections: Section[] = [];
        const user = await getUser(userId);
        let position = 0;
        for (let item of tags) {
            position++;
            let query = '';
            let type = '';
            if(isComingFrom == 'wallpaper'){
                query = "{\n" +
                "  getSectionWallpaper(query: \"getWallpapersByTag#"+ item +"\") {\n" +
                "    id\n" +
                "    title\n" +
                "    url_img\n" +
                "    url_storage\n" +
                "    likes\n" +
                "    dislikes\n" +
                "    by_downloads_count\n" +
                "    by_search_count\n" +
                "    user\n" +
                "    tags \n" +
                "  }\n" +
                "}";
                type = 'wallpapers';
            }else{
                query = "{\n" +
                "  getSectionCollection(query: \"getCollectionsByTag#"+ item +"\") {\n" +
                "    id\n" +
                "    by_search_count\n" +
                "    by_downloads_count\n" +
                "    banner_wallpapers {\n" +
                "       url_img\n" +
                "    }\n" +
                "    title \n" +
                "    wallpapers \n" +
                "    wallpapers_count \n" +
                "    tags \n" +
                "    user \n" +
                "  }\n" +
                "}";
                type = 'collections';
            }
            sections.push({
                description: 'Mas sobre ' + item.toUpperCase(),
                position: position,
                query: query,
                type: type
            });
        }
        //const sections: Section[] = await getSectionsWallpaperHome();
        response = {
            user: user,
            sections: sections
        }
    } catch (error) {
        console.log(error);
    }
    return response;
}

async function getWallpapersByTag(tag: String) {
    const wallpapers: Wallpaper[] = [];
    try {
        const snapshot = await wallpaperReference.collection('wallpapers').where('tags', 'array-contains', tag).limit(5).get();
        snapshot.forEach((doc: any) => {
            wallpapers.push(doc.data());
        });
    } catch (error) {
        console.log(error);
    }
    return wallpapers;
}

export async function getSectionWallpaper(query: String, userId: String) {
    if (userId != 'null') {
        console.log(userId)
    }
    let items: Wallpaper[] = [];
    const params = query.split('#');
    const finishQuery = params[0];
    switch (finishQuery) {
        case "getMostPopularTag":
            await getMostPopularTag().then((values: Wallpaper[]) => {
                items = values;
            });
            break;
        case "getRecentlyAdded":
            await getRecentlyAdded().then((values: Wallpaper[]) => {
                items = values;
            });
            break;
        case "getWallpapersByTag":
            await getWallpapersByTag(params[1]).then((values: Wallpaper[]) => {
                items = values;
            });
            break;
    }
    return items
}

async function getRecentlyAdded() {
    const wallpaper: Wallpaper[] = [];
    try {
        const snapshotWalls = await wallpaperReference.collection('wallpapers').orderBy('updated_status_datetime', 'desc').limit(10).get();
        snapshotWalls.forEach((doc: any) => {
            wallpaper.push(doc.data());
        })
    } catch (error) {
        console.log(error);
    }
    return wallpaper;
}

async function getMostPopularTag() {
    const wallpaper: Wallpaper[] = [];
    try {
        const snapshotWalls = await wallpaperReference.collection('wallpapers').where('status', '==', 'approved').limit(10).get();
        snapshotWalls.forEach((doc: any) => {
            wallpaper.push(doc.data());
        })
    } catch (error) {
        console.log(error);
    }
    return wallpaper;
}

export async function getSectionsWallpaperHome() {
    const sections: Section[] = [];
    try {
        const snapshot = await wallpaperReference.collection('sections').orderBy('position', 'asc').get();
        snapshot.forEach((doc: any) => {
            sections.push(doc.data());
        });
    } catch (error) {
        console.log(error);
    }
    return sections;
}

export async function getTopWeekWallpapers() {
    const wallpapers: Wallpaper[] = [];
    try {
        const snapshot = await wallpaperReference.collection('wallpapers').where('status', '==', 'approved').orderBy('by_downloads_count', 'desc').limit(10).get();
        snapshot.forEach((doc: any) => {
            wallpapers.push(doc.data());
        });
    } catch (error) {
        console.log(error);
    }
    return wallpapers;
}

export async function addNewWallpaper(wallpaper: Wallpaper) {
    let status = 'FAIL';
    try {
        const document = wallpaperReference.collection('wallpapers').doc();
        const new_tags = [];
        for (let item of wallpaper.tags) {
            new_tags.push(item.toLowerCase().trim());
        }
        await wallpaperReference.collection('wallpapers').doc(document.id).set({
            id: document.id,
            title: wallpaper.title.toLowerCase(),
            url_img: wallpaper.url_img,
            url_storage: wallpaper.url_storage,
            tags: new_tags,
            user: wallpaper.user,
            width: wallpaper.width,
            height: wallpaper.height,
            typeResolution: wallpaper.typeResolution,
            by_search_count: 0,
            by_downloads_count: 0,
            status: 'pending'
        });
        status = 'OK';
    } catch (error) {
        console.log(error);
    }
    return status;
}