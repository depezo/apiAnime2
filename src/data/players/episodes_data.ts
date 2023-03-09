import { Anime, TinyAnime, TinyAnimeLA } from "../anime/anime_data";
import { getPrimaryAndDownload } from "./lat_players_data";
import { Episode } from "./sub_players_data";

const admin = require('firebase-admin');
const firestore = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

interface LastEpisodeUploaded {
    tinyAnime: TinyAnimeLA
    nameEpisode: String
    url_img: String
    episode: number
    language: String
    episodes: Episode[]
}

export async function getWeekdayEmisionDub(weekday: String){
    console.log(weekday);
    const animes: Anime[] =[];
    try {
        const snapshot = await firestore.collection('anime').where('status_dub','==','in_emission').where('day_broadcast_lat','==',weekday).get();
        snapshot.forEach((doc: any) => {
            const anime = doc.data();
            if (doc.data().title == undefined){
                anime.title = "Sin titulo";
            }
            animes.push(anime);
        })
    } catch (error) {
        console.log(error);
    }
    return animes;
}

export async function getAllEmisionDub(){
    const animes: Anime[] =[];
    try {
        const snapshot = await firestore.collection('anime').where('status_dub','==','in_emission').get();
        snapshot.forEach((doc: any) => {
            const anime = doc.data();
            if (doc.data().title == undefined){
                anime.title = "Sin titulo";
            }
            animes.push(anime);
        })
    } catch (error) {
        console.log(error);
    }
    return animes;
}

export async function updateStatusEpisode(idAnime: number, status: String, language: String){
    let statusF = '';
    try {
        if(language == 'dub_es'){
            await firestore.collection('anime').doc(idAnime.toString()).set({
                status_dub: status == 'null' ? null : status,
                id: idAnime
            }, {merge: true});
        }else{
            await firestore.collection('anime').doc(idAnime.toString()).set({
                status_sub: status == 'null' ? null : status,
                id: idAnime
            }, {merge: true});
        }       
        status = 'OK'; 
    } catch (error) {
        console.log(error);
    }
    return statusF;
}

export async function updateHourEpisode(idAnime: number, hour: number, minute: number, language: String){
    let status = '';
    try {
        const time = new Date();
        time.setHours(hour+5);
        time.setMinutes(minute);
        console.log(time.toISOString());
        if(language == 'dub_es'){
            await firestore.collection('anime').doc(idAnime.toString()).set({
                hour_broadcast_lat: time.toISOString(),
                id: idAnime
            }, {merge: true});
        }else{
            await firestore.collection('anime').doc(idAnime.toString()).set({
                hour_broadcast_sub: time.toISOString(),
                id: idAnime
            }, {merge: true});
        }       
        status = 'OK'; 
    } catch (error) {
        console.log(error);
    }
    return status;
}

export async function updateWeekdayEpisode(idAnime: number, weekday: String, language: String){
    let status = '';
    try {
        if(language == 'dub_es'){
            await firestore.collection('anime').doc(idAnime.toString()).set({
                day_broadcast_lat: weekday == 'null' ? null : weekday,
                id: idAnime
            }, {merge: true});
        }else {
            await firestore.collection('anime').doc(idAnime.toString()).set({
                day_broadcast_sub: weekday == 'null' ? null : weekday,
                id: idAnime
            }, {merge: true});
        }        
        status = 'OK';
    } catch (error) {
        console.log(error);
    }
    return status
};

export async function getLastEpisodeUploaded(idAnime: number, isDebug: Boolean){
    let episodes: Episode[] = [];
    try {
        const data = await firestore.collection('last_episodes_uploaded').doc(idAnime.toString()).get();
        if (data.exists) {
            episodes = data.get('episodes');
            episodes = await getPrimaryAndDownload(episodes);
            if(episodes.length > 0 && isDebug == undefined){
                if(episodes[0].language == "dub_es"){
                    await firestore.collection('anime').doc(idAnime.toString()).collection('episodes').doc(data.get('episode').toString()).set({
                        count_viewed_lat: FieldValue.increment(1)
                    }, {merge: true});
                }else{
                    await firestore.collection('anime').doc(idAnime.toString()).collection('episodes').doc(data.get('episode').toString()).set({
                        count_viewed_sub: FieldValue.increment(1)
                    }, {merge: true});
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    return episodes;
}

export async function setLastEpisodeUploaded(tinyAnime: TinyAnimeLA, nameEpisode: String, url_img: String, episode: number, language: String, episodes: Episode[]) {
    let status = "";
    try {
        const leu = {} as LastEpisodeUploaded;
        leu.tinyAnime = tinyAnime;
        leu.nameEpisode = nameEpisode;
        leu.url_img = url_img;
        leu.episode = episode;
        /*const episodesA: Episode[] = [];
        for (let item of episodes) {
            episodesA.push(await getEpisodesFromUrl(item, language,isDownloable,download_url,type_download));
        }*/
        leu.episodes = episodes;
        await firestore.collection('last_episodes_uploaded').doc(tinyAnime.idAnime.toString()).collection(language).doc(episode.toString()).set(leu);
        await firestore.collection('last_episodes_uploaded').doc(tinyAnime.idAnime.toString()).set({
            tinyAnime: tinyAnime,
            nameEpisode: nameEpisode,
            url_img: url_img,
            episode: episode,
            language: language,
            episodes: episodes,
            last_datetime_uploaded: FieldValue.serverTimestamp()
        });
        status = "ADDED";
    } catch (error) {
        console.log(error);
    }
    return status;
}

async function getEpisodesFromUrl(episode_url: String, language: String,isDownloable: Boolean,download_url: String,type_download: String) {
    let new_url = episode_url.split('$#@*')[1];
    let type = 'secondary';
    const episode = {} as Episode;
    episode.language = language.toString();
    try {
        switch (episode_url.split('$#@*')[0]) {
            case 'primary':
                new_url = episode_url.split('$#@*')[1];
                type = 'primary'
                break;
            case 'secondary':
                new_url = episode_url.split('$#@*')[1];
                type = 'secondary'
                break;
        }
    } catch (error) {
        console.log(error);
    }
    episode.type = type;
    episode.url = new_url;
    episode.downloable = isDownloable;
    episode.url_download = download_url;
    episode.type_downloable = type_download;
    return episode;
}