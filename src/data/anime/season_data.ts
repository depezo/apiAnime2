import { analytics } from "firebase-functions/v1";
import { Genre } from "./genres_data";
import { Producer, ShortProducer } from "./producer_data";
const cheerio = require('cheerio');
const axios = require('axios').default;
const translate = require('translate');

export interface AnimeSeason {
    id: number
    title: String
    synopsis: String
    producer: ShortProducer
    source: string
    episodes: number
    url_page: String
    url_img: String
    score: number
    type: String
    release: String
    genres: Genre[]
}

export function getAnimesSeason(year: number, season: string) {
    const url = 'https://myanimelist.net/anime/season/' + year + '/' + season;
    return getDataAnimeSeason(url);

}

export async function getDataAnimeSeason(url: string) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const dataSA = $('.seasonal-anime-list');
        var animesSeason: AnimeSeason[] = [];
        dataSA.map(function (i: any, value: any) {
            const data = $(value).find('.seasonal-anime');
            const type = $(value).find('.anime-header').text()
            data.map(function (i: any, value: any) {
                const id = $(value).find('.genres').attr('id');
                const title = $(value).find('.title-text > .h2_anime_title').text();
                const url_page = $(value).find('.title-text > .h2_anime_title > a').attr('href');
                var url_img = "";
                if (String($(value).find('.image > a > img').attr('data-src')) != 'undefined') {
                    url_img = String($(value).find('.image > a > img').attr('data-src'));
                } else {
                    url_img = String($(value).find('.image > a > img').attr('src'));
                }
                url_img = String(url_img).replace('.jpg','l.jpg');
                var idP = 0;
                var descriptionP = "";
                var source = "";
                const dataProperties = $(value).find('.synopsis > .properties > .property')
                dataProperties.map(function (i:any, val:any){
                    if(String($(val).find('.caption').text()) == 'Studio'){
                        if (String($(val).find('.item').text()).trim() != 'Unknown') {
                            idP = Number(String($(value).find('.item > a').attr('href')).split('/producer/')[1].split('/')[0]);
                            descriptionP = $(val).find('.item > a').attr('title');
                        }
                    }
                    if(String($(val).find('.caption').text()) == 'Source'){
                        source = $(val).find('.item').text();
                    }    
                });
                const producer: ShortProducer = { id: idP, description: descriptionP };
                var episodes = 0;
                if (String($(value).find('.eps > a').text()).replace('eps', '').replace('ep', '').trim() != '?') {
                    episodes = Number(String($(value).find('.eps > a').text()).replace('eps', '').replace('ep', ''));
                }
                
                const synopsisNT = $(value).find('.synopsis > .preline').text();
                const synopsis = translate(synopsisNT, 'es');
                const dataG = $(value).find('.genres > .genres-inner > .genre');
                var genres: Genre[] = [];
                dataG.map(function (i: any, value: any) {
                    const idG = Number(String($(value).find('a').attr('href')).split('/genre/')[1].split('/')[0]);
                    const descriptionG = $(value).find('a').text();
                    genres.push({ id: idG, description: descriptionG });
                });
                const dataG2 = $(value).find('.synopsis > .mb4');
                dataG2.map(function (i: any, value: any) {
                    if ($(value).find('.fw-b').text() == 'Theme:' || $(value).find('.fw-b').text() == 'Demographic:') {
                        const idG = Number(String($(value).find('a').attr('href')).split('/genre/')[1].split('/')[0]);
                        const descriptionG = $(value).find('a').text();
                        genres.push({ id: idG, description: descriptionG });
                    }
                });
                var score = 0.0;
                if (String($(value).find('.information > .information-item > .scormem-container > .scormem-item').text()).trim().split('\n')[0] != 'N/A') {
                    score = Number(String($(value).find('.information > .information-item > .scormem-container > .scormem-item').text()).trim().split('\n')[0]);
                }
                //const type = String($(value).find('.information > .info').text()).split('-')[0].trim();
                const release = String($(value).find('div > .prodsrc > .info > .item').text()).split('\n')[0].trimStart().trimEnd();
                var stateH = false;
                for (var item of genres){
                    if(item.id == 12){
                        stateH = true;
                        break;
                    }
                }
                if(!stateH){
                    animesSeason.push({
                        id,
                        title,
                        synopsis,
                        producer,
                        source,
                        episodes,
                        url_page,
                        url_img,
                        score,
                        type,
                        release,
                        genres
                    });
                }                
            });
        });
        return animesSeason;
    } catch (error) {
        console.log(error);
    }

}
