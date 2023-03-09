import { TinyAnime } from "./anime_data";
import { Character } from "./character_data";
const cheerio = require('cheerio');
const axios = require('axios').default;

export interface Actor {
    id:number
    name:string
    url_img: string
    url_page: string
}

interface ActorFull {
    id:number
    name: String
    description: String
    url_page:String
    url_img: String
    birthday:String
    website:String
    animes: TinyAnime[]
    characters: Character[]
}

export async function getActor(idA: number){
    try {
        const url = 'https://myanimelist.net/people/' + idA
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const id = Number(url.split('people/')[1].split('/')[0]);
        const name = $('.h1-title > .title-name > strong').html();
        const url_img = $('.borderClass > div > a > img').attr('data-src');
        const description = $('.people-informantion-more').text();
        const url_page = url;
        const dataB = $ ('.borderClass > .spaceit_pad');
        const dataW = $('.borderClass > span');
        const dataA = $('.js-people-character');
        var birthday = "";
        var website= "";
        var animes : TinyAnime[] = [];
        var characters : Character[] = [];
        dataB.map(function(i:any, value:any){
            if(String($(value).find('span').html()).includes('Birthday:')){
                birthday = String($(value).text()).replace('Birthday:','');
            }
        });
        dataW.map(function(i:any, value:any){
            if(String($(value).text()).includes('Website:')){
                website = String($(value).text()).replace('Website:','');
            }
        });
        dataA.map(function(i:any, value:any){
            const data = $(value).find('td');
            var idA = 0;
            var title = "";
            var url_imgA = "";
            var url_pageA = "";
            var idChar = 0;
            var nameChar = "";
            var url_pageChar = "";
            var url_imgChar = "";
            data.map(function(i:any,value:any){
                if( i == 0){
                    idA = Number(String($(value).find('a').attr('href')).split('anime/')[1].split('/')[0]);
                    url_imgA = String($(value).find('a > img').attr('data-src')).replace('r/84x124/','');
                    url_pageA = $(value).find('a').attr('href');
                    
                }else if( i == 1){
                    title = $(value).find('.spaceit_pad > a').text();
                }else if( i == 2){
                    nameChar = $(value).find('.spaceit_pad > a').text();
                    url_pageChar = $(value).find('.spaceit_pad > a').attr('href');
                    idChar = Number(String($(value).find('.spaceit_pad > a').attr('href')).split('character/')[1].split('/')[0]);
                }else{
                    url_imgChar = String($(value).find('.picSurround > a > img').attr('data-src')).replace('r/84x124/','');
                }
            });
            animes.push({
                id:idA,
                title,
                url_img:url_imgA,
                url_page:url_pageA,
            });
            const actor : Actor = {id,name,url_page,url_img};
            characters.push({
                id:idChar,
                name:nameChar,
                url_img:url_imgChar,
                url_page:url_pageChar,
                actor
            });
        });
        const actor_full : ActorFull = {
            id,
            name,
            description,
            url_page,
            url_img,
            birthday,
            website,
            animes,
            characters,
        };
        return actor_full;
    } catch (error) {
        console.log(error);
    }
}