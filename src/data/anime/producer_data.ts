import { ShortNews } from "./news_data";
const translate = require('translate');
const cheerio = require('cheerio');
const axios = require('axios').default;

export interface Producer {
    id: number
    name: String
    url_img: String
    description: String
    established: String
    recent_news: ShortNews
    url_news: String
    social: Social[]
    animes: ShortAnime[]
}

interface Social {
    type: String
    url: String
}

interface ShortAnime {
    id: number
    title: String
    url_img: String
    stars: number
}

export interface ShortProducer {
    id: number
    description: String
}

export async function getProducerAnimes(id: number) {
    const url = 'https://myanimelist.net/anime/producer/' + id;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const content_left = $('#content > .content-left');
    const name = $(content_left).find('.logo > img').attr('alt');
    const url_img = $(content_left).find('.logo > img').attr('data-src');
    const data_left = $(content_left).find('.mb16 > .spaceit_pad');
    const data_news = $('.news-unit');
    const idN = Number(String($(data_news).find('.news-unit-right > .title > a').attr('href')).split('news/')[1]);
    const titleNT = $(data_news).find('.news-unit-right > .title > a').text();
    const url_imgN = String($(data_news).find('a > img').attr('src')).replace('r/100x156/','');
    const textNT = String($(data_news).find('.news-unit-right > .text').text()).trimStart().trimEnd();
    const data_tagsN = $(data_news).find('.news-unit-right > .information > .tags > a');
    const data_animes = $('.js-categories-seasonal > .js-anime-category-studio');
    const url_news = $('.content-right > .normal_header > .mt4 > a').attr('href');
    const animes: ShortAnime[] = [];
    data_animes.map(function (i:any, value: any){
        const id = Number(String($(value).find('.image > a').attr('href')).split('anime/')[1].split('/')[0]);
        const url_img = $(value).find('.image > a > img').attr('data-src');
        const title = String($(value).find('.title').text()).trimStart().trimEnd();
        var stars = 0.0;
        if(!String($(value).find('.widget > .stars').text()).includes('N/A')){
            stars = Number(String($(value).find('.widget > .stars').text()));
        }        
        animes.push({
            id,
            title,
            url_img,
            stars
        });
    });
    const tagsN: String[] = [];
    data_tagsN.map(function (i:any, value:any){
        tagsN.push($(value).text());
    });
    var established = "";
    var descriptionNT = "";
    data_left.map(function (i: any, value: any) {
        //console.log('' + i + ' length: ');
        if (String($(value).text()).includes('Established:')) {
            established = String($(value).text()).replace('Established:', '').trimStart().trimEnd();
        } else if (i === 3) {
            descriptionNT = String($(value).text()).trimStart().trimEnd();
        }
    });
    const dataSocial = $(content_left).find('.user-profile-sns > span > a');
    const social: Social[] = [];
    dataSocial.map(function (i: any, value: any) {
        const object = String($(value).attr('href'));
        var typeS = ""
        switch (true) {
            case object.includes('twitter'):
                typeS = 'Twitter';
                break;
            case object.includes('youtube'):
                typeS = 'Youtube';
                break;
            case object.includes('facebook'):
                typeS = 'Facebook';
                break;
            case object.includes('instagram'):
                typeS = 'Instagram';
                break;
            default:
                typeS = 'Otro'
                break;
        }
        social.push({
            type: typeS,
            url: object
        })
    });
    const textN = textNT ? await translate(textNT,'es')  : "";
    const titleN = titleNT ? await translate(titleNT,'es'): "";
    var recent_news: ShortNews = {id: 0, tags: [],text: "",title: "",url_img: ""};
    console.log("" + idN)
    if(idN != null && idN != undefined && !Number.isNaN(idN)){
        recent_news = {
            id: idN,
            title: titleN,
            text: textN,
            url_img: url_imgN,
            tags: tagsN
        };
    }
    const description = descriptionNT ? await translate(descriptionNT,'es') : "";
    const producer: Producer = {
        id,
        name,
        url_img,
        url_news,
        description,
        established,
        recent_news,
        animes,
        social
    };
    return producer;
}