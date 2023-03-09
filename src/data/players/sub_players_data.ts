import { getDataOnDB } from "./lat_players_data";

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios').default;
const { gotScraping } = require('got-scraping');
const admin = require('firebase-admin');
const firestore = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

export interface Episode {
    type: String
    url: String
    language: string
    downloable: Boolean
    type_downloable: String
    url_download: String
}

export async function getSubEpisodes(name: string, episode: number, idAnime: number, isDebug: Boolean) {
    let episodes: Episode[] = [];
    const data = await firestore.collection('last_episodes_uploaded').doc(idAnime.toString()).collection('sub_es').doc(episode.toString()).get();
    if (data.exists) {
        episodes = data.get('episodes');
    } else {
        const urlAFX = await generateUrlAFX(name, episode);
        const urlJK = await generateUrlJK(name, episode);
        episodes = await getSubEpisodeAFX(urlAFX);
        var dataJK = await getSubEpisodeJK(urlJK);
        for (var val of dataJK) {
            episodes.push(val);
        }
        if(episodes.length > 0 && isDebug == undefined){
            await firestore.collection('anime').doc(idAnime.toString()).collection('episodes').doc(episode.toString()).set({
                count_viewed_sub: FieldValue.increment(1)
            }, {merge: true});
        }
    }
    //console.log(episodes);
    return episodes;
}

async function generateUrlAFX(name: string, episode: number) {
    var nameAFX = name.replace('.', '').replace(', ', '-').replace(': ', '-').replace(/\s/g, '-').toLowerCase();
    const names = await getDataOnDB('sub_es');
    names.map(function (i: any, value: any) {
        if (i.includes(name)) {
            const values = i.split(',');
            let newName = '';
            for (let i = 0; i < values.length; i++) {
                if (i != values.length - 1) {
                    if (i == 0) {
                        newName = values[i];
                    } else {
                        newName = newName + ',' + values[i];
                    }
                }
            }
            console.log(newName);
            if (newName === name) {
                if (i.includes(',')) {
                    nameAFX = values[values.length - 1];
                }
            }
        }
    });
    const url = 'https://www.animefenix.com/ver/' + nameAFX + '-' + episode;
    console.log(url);
    return url;
}

async function generateUrlJK(name: string, episode: number) {
    var nameJK = name.replace('.', '').replace(', ', '-').replace(': ', '-').replace(/\s/g, '-').toLowerCase();
    const names = await getDataOnDB('sub_es');
    names.map(function (i: any, value: any) {
        if (i.includes(name)) {
            const values = i.split(',');
            let newName = '';
            for (let i = 0; i < values.length; i++) {
                if (i != values.length - 1) {
                    if (i == 0) {
                        newName = values[i];
                    } else {
                        newName = newName + ',' + values[i];
                    }
                }
            }
            console.log(newName);
            if (newName === name) {
                if (i.includes(',')) {
                    nameJK = values[values.length - 1];
                }
            }
        }
    });
    const url = 'https://jkanime.net/' + nameJK + '/' + episode;
    console.log('nameJK: ', url);
    return url;
}

async function getSubEpisodeAFX(url: string) {
    var episodes: Episode[] = [];
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const script = $('.player-container > script');
        var tags = [];
        var dataT = String($(script).html()).split('] = "');
        for (var val of dataT) {
            if (val.includes('iframe')) {
                tags.push(val.split('";')[0].trimStart().trimEnd());
            }
        }
        for (var val of tags) {
            const iframe = cheerio.load(val);
            if (!String(iframe('iframe').attr('src')).includes('um2.php')) {
                episodes.push({
                    type: 'secondary',
                    url: iframe('iframe').attr('src'),
                    language: 'sub_es',
                    downloable: false,
                    type_downloable: "NONE",
                    url_download: ''
                });
            }
        }
        //console.log(episodes);
        return episodes;
    } catch (error) {
        console.log(error);
        return episodes;
    }
}

async function getSubEpisodeAFLV() {
    try {
        const url = 'https://www3.animeflv.net/ver/komisan-wa-comyushou-desu-1';
        var data = '';
        await gotScraping.get(url).then((body: any) => {
            data = body.body;
        });
        data = data.split('</head>')[1].split('</html>')[0];
        const $ = cheerio.load(data);
        const scripts = $('script');
        var video: String[] = [];
        var dataJson = '';
        scripts.map(function (i: any, value: any) {
            if (String($(value).html()).includes('var videos = {"SUB":')) {
                dataJson = String($(value).html()).split('var videos =')[1].split(';')[0];
            }
        });
        //const json  = JSON.parse(dataJson);
        console.log(dataJson);
        //getPlayers();
    } catch (error) {
        console.log(error);
    }
}

async function getSubEpisodeJK(url: string) {
    var episodes: Episode[] = [];
    try {
        const baseUrl = 'https://jkanime.net'
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const scripts = $('script');
        var video: String[] = [];
        scripts.map(function (i: any, value: any) {
            if (String($(value).html()).includes('var video = [];')) {
                var tags = [];
                var dataT = String($(value).html()).split("] = '");
                for (var val of dataT) {
                    if (val.includes('iframe')) {
                        tags.push(val.split("';")[0].trim());
                    }
                }
                for (var val of tags) {
                    const iframe = cheerio.load(val);
                    if (!String(iframe('iframe').attr('src')).includes('um2.php')) {
                        let url = iframe('iframe').attr('src');
                        if(!String(iframe('iframe').attr('src')).includes('mega.nz')){
                            url = baseUrl + iframe('iframe').attr('src');
                        }
                        video.push(url);
                    }
                }
            }
        });
        for (var val of video) {
            if (val.includes('jk.php') || val.includes('um.php')) {
                const dataU = String(await getDirectLink(val));
                if (dataU != "") {
                    episodes.push({
                        type: 'primary',
                        url: dataU,
                        language: 'sub_es',
                        downloable: false,
                        type_downloable: "NONE",
                        url_download: ''
                    });
                }
            } else {
                if(!val.includes('jkfembed.php')){
                    episodes.push({
                        type: 'secondary',
                        url: val,
                        language: 'sub_es',
                        downloable: false,
                        type_downloable: "NONE",
                        url_download: ''
                    });
                }
            }
        }
        return episodes;
        //getPlayers();
    } catch (error) {
        console.log(error);
        return episodes;
    }
}

async function getDirectLink(url: String) {
    var urlDirect: String = "";
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data)
        if (url.includes('um.php')) {
            const scripts = $('script');
            scripts.map(function (i: any, value: any) {
                if (String($(value).html()).includes('var parts = {')) {
                    urlDirect = String($(value).html()).split("swarmId: '")[1].split("',")[0];
                }
            });
        }
        return urlDirect;
    } catch (error) {
        console.log(error);
        return urlDirect;
    }
}