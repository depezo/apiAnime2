import { Episode } from "./sub_players_data";

const cheerio = require('cheerio');
const axios = require('axios').default;
const serviceAccount = require('../../animeapp-a8b2c-firebase-adminsdk-qul5q-c256baff7f.json');
const admin = require('firebase-admin');
const { gotScraping } = require('got-scraping');
const puppeteer = require('puppeteer');
const FieldValue = admin.firestore.FieldValue;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://animeapp2test-default-rtdb.firebaseio.com/'
    //databaseURL: 'https://testingproject-6874f-default-rtdb.firebaseio.com'
});
const firestore = admin.firestore();

export async function getLatEpisodes(name: string, episode: number, idAnime: number, isDebug: Boolean) {
    var episodes: Episode[] = [];
    try {
        const data = await firestore.collection('last_episodes_uploaded').doc(idAnime.toString()).collection('dub_es').doc(episode.toString()).get();
        if (data.exists) {
            episodes = data.get('episodes');
            episodes = await getPrimaryAndDownload(episodes);
        } else {
            const namesLat = await getDataOnDB("latino");
            var source = '';
            var secondNameAHD = '';
            var nameHej = '';
            var typeHej = '';
            namesLat.map(function (i: any, value: any) {
                if (i.includes(name)) {
                    if (i.includes('#')) {
                        if (i.split('#')[0] === name) {
                            source = 'ahd';
                            secondNameAHD = i.split('#')[1];
                        }
                    } else if (i.includes(',,')) {
                        if (i.split(',,')[0] === name) {
                            if (i.includes(';')) {
                                typeHej = 'm';
                                source = 'hej';
                                nameHej = i.split(',,;')[1];
                            } else {
                                typeHej = 'e';
                                source = 'hej';
                                nameHej = i.split(',,')[1];
                            }
                        }
                    }
                }
            });
            if (source == 'ahd' || source == '') {
                const urlAHD = generateUrlAHD(source == 'ahd' ? secondNameAHD : name, episode);
                episodes = await getLatEpisodesAHD(urlAHD);
            } else if (source == 'hej') {
                const urlHEJ = generateUrlHEJ(nameHej, episode, typeHej);
                episodes = await getLatEpisodesHEJ(urlHEJ);
            }
        }
        if(episodes.length > 0 && isDebug == undefined){
            await firestore.collection('anime').doc(idAnime.toString()).collection('episodes').doc(episode.toString()).set({
                count_viewed_lat: FieldValue.increment(1)
            }, {merge: true});
        }
        return episodes;
    } catch (error) {
        console.log(error)
        return episodes;
    }
}



export async function getPrimaryAndDownload(episodes: Episode[]) {
    let newList: Episode[] = [];
    let mfUrl: String = '';
    for (const item of episodes) {
        let episode = item;
        switch (true) {
            case item.url.includes('sendvid.com'):
                /*const nUrl = await getSendvidPrimary(item.url);
                if (nUrl != item.url) {
                    episode.url = nUrl;
                    episode.type = 'primary';
                }*/
                break;
        }
        switch (true) {
            case item.url_download.includes('mediafire.com'):
                if (mfUrl == '') {
                    mfUrl = await getMediafireDirect(item.url_download);
                    const ep: Episode = {
                        url: mfUrl,
                        url_download: mfUrl,
                        type: 'primary',
                        type_downloable: 'DIRECT',
                        downloable: true,
                        language: 'dub_es'
                    }
                    newList.push(ep);
                }
                episode.url_download = mfUrl;
                episode.type_downloable = 'WEB';
                break;
        }

        newList.push(episode);
    }
    return newList;
}

async function getMediafireDirect(url_download: String) {
    let newUrl = url_download;
    try {
        const { data } = await axios.get(url_download);
        const $ = cheerio.load(data);
        const downloadSource = $('.download_link > .input');
        newUrl = String(downloadSource.attr('href'));
    } catch (error) {
        console.log(error);
    }
    return newUrl;
}

async function getSendvidPrimary(url: String) {
    let newUrl = url;
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const sourceData = $('.embeded > video > source');
        newUrl = String(sourceData.attr('src'));
    } catch (error) {
        console.log(error);
    }
    return newUrl;
}

export async function getFembedPrimary(url: String) {
    try {
        
    } catch (error) {
        console.log(error);
    }
}

async function getFireloadPrimary(url: String) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const player = $('.fileInfo > .download-timer > btn');
        const urlPrimary = player.attr('href');
        console.log(player);
    } catch (error) {
        console.log(error);
    }
}


function generateUrlAHD(name: string, episode: number) {
    const nameAHD = name.replace('.', '').replace(', ', '-').replace(': ', '-').replace(/\s/g, '-').toLowerCase();
    const url = 'https://www.animelatinohd.com/ver/' + nameAHD + '/' + episode;
    //console.log(url);
    return url;
}

function generateUrlHEJ(name: string, episode: number, type: string) {
    var url = '';
    if (type == 'e') {
        url = 'https://henaojara.com/ver/episode/' + name + '-espanol-latino-hd-1x' + episode;
    } else {
        url = 'https://henaojara.com/' + name;
    }
    //console.log(url);
    return url;
}

export async function getDataOnDB(type: string) {
    var data: string[] = [];
    try {
        await admin.database().ref('animes_extra/' + type).once('value').then((snap: any) => snap.val()).then((val: any) => {
            val.map(function (i: any, value: any) {
                //console.log(i);
                data.push(i);
            });
        });
        return data;
    } catch (error) {
        console.log(error);
        return data;
    }
}

async function getLatEpisodesHEJ(url: string) {
    var episodes: Episode[] = [];
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const players = $('.TPlayerTb');
        players.map(function (i: any, value: any) {
            var url = '';
            if (i == 0) {
                url = String($(value).find('iframe').attr('src'));
            } else {
                const iframe = String($(value).html()).replace('&gt;&lt;', '=""><').replace('&gt;', '>').replace('&lt;', '<');
                url = String($(iframe).attr('src')).replace("amp;", "").replace("#038;", "");

            }
            episodes.push({
                type: 'secondary',
                url: url,
                language: 'lat',
                downloable: false,
                type_downloable: "NONE",
                url_download: ''
            });
        });
        //console.log(episodes);
        return episodes;
    } catch (error) {
        console.log(error);
        return episodes;
    }
}

async function getLatEpisodesAHD(url: string) {
    var episodes: Episode[] = [];
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const dataJson = JSON.parse($('#__NEXT_DATA__').html());
        for (let val of dataJson.props.pageProps.data.players[1]) {
            if (val.languaje == '1' && !String(val.code).includes('fembed.com')) {
                let type_downloable = "NONE";
                let downloable = false;
                let urlVideo = 'https://api.animelatinohd.com/stream/' + val.id;
                if (String(val.code).endsWith('.mp4')) {
                    downloable = true;
                    type_downloable = "DIRECT"
                }
                if (String(val.code).includes('od.lk') || String(val.code).includes('animelatinohd-my.sharepoint.com')) {
                    episodes.push({
                        type: 'primary',
                        url: urlVideo,
                        language: 'lat',
                        downloable: downloable,
                        type_downloable: type_downloable,
                        url_download: urlVideo
                    });
                } else {
                    episodes.push({
                        type: 'secondary',
                        url: urlVideo,
                        language: 'lat',
                        downloable: false,
                        type_downloable: "NONE",
                        url_download: ''
                    });
                }
            }
        }
        return episodes;
    } catch (error) {
        console.log(error);
        return episodes;
    }
}