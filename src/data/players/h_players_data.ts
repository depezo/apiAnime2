import { getDataOnDB } from "./lat_players_data";
import { Episode } from "./sub_players_data";

const cheerio = require('cheerio');
const axios = require('axios').default;

export async function getHEpisodes(name:string,episode:number) {
    var episodes: Episode[] = [];
    try {
        const url = await generateUrlH(name,episode);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const scripts = $('body > script');
        scripts.map(function (i: any, value: any) {
            const script = String($(value));
            if (script.includes('var videos = ')) {
                const dataJson = script.split('var videos = ')[1].split(';')[0];
                //console.log(dataJson);
                const json = JSON.parse(dataJson);
                json.map(function (i: any, value: any) {
                    if (json[value][0] == 'Arc') {
                        episodes.push({
                            type: 'primary',
                            url: String(json[value][1]).replace('/direct.html#', ''),
                            language: 'sub_es',
                            downloable: false,
                            type_downloable: "",
                            url_download: ''
                        })
                    } else {
                        episodes.push({
                            type: 'secondary',
                            url: json[value][1],
                            language: 'sub_es',
                            downloable: false,
                            type_downloable: "",
                            url_download: ''
                        })
                    }
                });
                //console.log(json[0][0]);
            }
        });
        console.log(url);
        return episodes;
    } catch (error) {
        console.log(error);
        return episodes;
    }
}


async function generateUrlH(name:string,episode:number){
    var title = name.replace('.','').replace(', ','-').replace(': ','-').replace(/\s/g,'-').replace('!','').toLowerCase();
    const names = await getDataOnDB('hentai');
        names.map(function (i: any, value: any) {
            if (i.includes(name)) {
                if (i.split(',,')[0] === name) {
                    if (i.includes(',,')) {
                        title = i.split(',,')[1]; 
                    }
                }
            }
        });
    const url = 'https://hentaila.com/ver/' + title + '-' + episode;
    return url;
}