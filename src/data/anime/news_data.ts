const cheerio = require('cheerio');
const axios = require('axios').default;
const translate = require('translate');

interface News {
    id: number
    title: String
    url_img: String
    text: String
    url_video: String
    tags: String[]
    related_news: RelatedNews[]
    related_anime: RelatedAnimeNews
}

interface RelatedNews {
    id: number
    url_img: String
    title: String
}

interface RelatedAnimeNews {
    id: number
    title: String
}

export interface ShortNews {
    id: number
    title: String
    url_img: String
    text: String
    tags: String[]
}

export async function getNews(id: number) {
    try {
        const url = 'https://myanimelist.net/news/' + id;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const container = $('.news-container');
        const titleNT = $(container).find('.title > a').text();
        var url_img = $(container).find('.content > img').attr('src');
        if( url_img == null){
            url_img = ""
        }
        const textNT = String($(container).find('.content').text()).trimEnd().trimStart();
        var url_video = "";
        if (String($(container).find('.content > iframe').attr('src')) != null) {
            url_video = String($(container).find('.content > iframe').attr('src'));
        }
        const title = await translate(titleNT, 'es');
        var text = "";
        if(textNT.length > 5000){
            const  temp_text = textNT.substring(0,4996) + "..."
            text = await translate(temp_text, 'es');
        }else{
            text = await translate(textNT, 'es');
        }
        const tags: String[] = [];
        const data_tags = $(container).find('.tags > a');
        data_tags.map(function (i: any, value: any) {
            tags.push($(value).text());
        });
        var idRA = 0
        var titleRA = ""
        if (String($('.news-related-database > tbody > tr').text()).includes('Anime:')) {
            idRA = Number(String($('.news-related-database > tbody > tr > td > a').attr('href')).split('anime/')[1].split('/')[0]);
            titleRA = $('.news-related-database > tbody > tr > td > a').text();
        }
        const data_rn = $('.news-side-block > .news-list > .news');
        const related_news: RelatedNews[] = [];
        data_rn.map(function (i: any, value: any) {
            const id = Number(String($(value).find('a').attr('href')).split('news/')[1]);
            const titleNT = String($(value).find('div > .title').text()).trimEnd().trimStart();
            const title = translate(titleNT, 'es');
            const url_img = String($(value).find('a > img').attr('src')).replace('r/50x50/','');
            related_news.push({ id, url_img, title });
        });
        const related_anime: RelatedAnimeNews = { id: idRA, title: titleRA };
        const news: News = {
            id,
            title,
            text,
            url_img,
            url_video,
            tags,
            related_anime,
            related_news
        }
        return news;
    } catch (error) {
        console.log(error);
    }
}

export async function getAllNews(page: number){
    try {
        const p = page > 1 ?'?p='+(page): '';
        const url = 'https://myanimelist.net/news' + p;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const dataAN = $('.content-left > div > .news-list > .clearfix');
        return getShortNews(dataAN,$);
    } catch (error) {
        console.log(error);
    }
}

export async function getNewsByProducer(url: String){
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const dataAN = $('.content-right > .news-list > .clearfix');
        return getShortNews(dataAN,$);
    } catch (error) {
        console.log(error);
    }
}

export async function getNewsByTag(tag: String, page: number){
    try {
        const p = page > 1 ?'?p='+(page): '';
        const t = tag.toLowerCase().replace(' ','_');
        const url = 'https://myanimelist.net/news/tag/' + t + p;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const dataAN = $('.content-left > .news-list > .clearfix');
        return getShortNews(dataAN,$);
    } catch (error) {
        console.log(error);
    }
}

export function getShortNews(content: any, $: any) {
    const short_news: ShortNews[] = []
    try {
        content.map(function (i: any, value: any) {
            const id = Number(String($(value).find('.news-unit-right > .title > a').attr('href')).split('news/')[1]);
            const titleNT = $(value).find('.news-unit-right > .title > a').text();
            const url_img = String($(value).find('a > img').attr('src')).replace('r/100x156/', '');
            const textNT = String($(value).find('.news-unit-right > .text').text()).trimStart().trimEnd();
            const tags: String[] = [];
            const data_tags = $(value).find('.news-unit-right > .information > .tags > a');
            data_tags.map(function (i: any, value: any) {
                tags.push($(value).text());
            });
            const text = translate(textNT, 'es');
            const title = translate(titleNT, 'es');
            short_news.push({
                id,
                title,
                text,
                url_img,
                tags
            })
        });
    } catch (error) {
        console.log(error);
    }
    return short_news
}