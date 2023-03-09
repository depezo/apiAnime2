const cheerio = require('cheerio');
const axios = require('axios').default;

interface TopAnime {
    id:number
    title:String
    rank: number
    type:String
    score:number
    episodes:number
    url_page:String
    url_img:String
    emision:String
}

export async function getTopAnimes(typeAnime:string,page:number){
    try {
        const limit = page*50-50;
        const uri = 'https://myanimelist.net/topanime.php?type=' + typeAnime + '&limit=' +limit;
        const { data } = await axios.get(uri);
        const $ = cheerio.load(data);
        const dataTA = $('.ranking-list');
        var top_animes : TopAnime[]=[];
        dataTA.map(function(i:any,value:any){
            const rank = Number($(value).find('.rank > span').text());
            const id = Number(String($(value).find('.title > a').attr('href')).split('/anime/')[1].split('/')[0]);
            const url_page = $(value).find('.title > a').attr('href');
            const url_img = String($(value).find('.title > a > img').attr('data-src')).replace('r/50x70/','');
            const title = $(value).find('.title > .detail > div > h3 > a').text();
            const dataI = String($(value).find('.title > .detail > .information').text()).trimStart().trimEnd().split('\n');
            const type = dataI[0].split(' ')[0];
            var episodes = 0;
            if(dataI[0].split(type)[1].replace('(','').replace(')','').replace('eps','').replace('ep','').trim() != '?'){
                episodes = Number(dataI[0].split(type)[1].replace('(','').replace(')','').replace('eps','').replace('ep',''));
            }
            const emision = dataI[1].trimStart().trimEnd();
            const score = Number($(value).find('.score > div > span').text());
            top_animes.push({
                id,
                title,
                rank,
                type,
                score,
                episodes,
                url_page,
                url_img,
                emision
            });
        });
        return top_animes;
    } catch (error) {
        console.log(error);
    }
}