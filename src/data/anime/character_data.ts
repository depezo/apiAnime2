import { Actor } from "./actor_data";
const translate = require('translate');
const cheerio = require('cheerio');
const axios = require('axios').default;

export interface Character {
    id: number
    name: string
    url_page: string
    url_img: string
    actor: Actor
}

interface CharacterFull {
    id: number
    name: string
    url_page: string
    url_img: string
    age: string
    birthday: string
    blood_type: string
    height: string
    description: string
    actor: Actor
}

export async function getCharacter(idC: number) {
    try {
        const url = 'https://myanimelist.net/character/' + idC;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const name: string = $('h2').text();
        const dataDesc = $('#content > table > tbody > tr > td');
        const id = Number(url.split("character/")[1].split("/")[0]);
        const url_img = $('#content > table > tbody > tr > .borderClass > div > a > img').attr('data-src');
        const url_page = url;
        var age = "";
        var birthday = "";
        var blood_type = "";
        var height = "";
        var descriptionNT = "";
        var actor: Actor;
        var id_actor = 0;
        var name_actor = "";
        var url_imgActor = "";
        var url_pageActor = "";
        dataDesc.map(function (i: any, value: any) {
            if (i == 1) {
                const dataC = String($(value).text()).split('\n');
                var state = 0;
                var dataD: string[] = [];
                for (var val of dataC) {
                    if (val.includes('Age:')) {
                        const dataAge = val.split('Age:');
                        age = dataAge[dataAge.length - 1];
                    } else if (val.includes('Birthday:')) {
                        birthday = val.replace('Birthday:', '').trimStart().trimEnd();
                    } else if (val.includes('Blood type:')) {
                        blood_type = val.replace('Blood type:', '').trimStart().trimEnd();
                    } else if (val.includes('Height:')) {
                        height = val.replace('Height:', '').trimStart().trimEnd();
                    }
                    if (val.includes(name)) {
                        state = 1;
                    } else if (val.includes('Voice Actors')) {
                        state = 2;
                    }
                    if (state == 1) {
                        if (val.includes('Age:') == false && val.includes('Birthday:') == false && val.includes('Blood type:') == false && val.includes('Height:') == false) {
                            dataD.push(val);
                        }
                    }
                }
                descriptionNT = String($(value).clone().children().remove().end().text()).trimStart().trimEnd();
                /*for (var val of dataD) {
                    if (val.trimStart().trimEnd() != '') {
                        description = description + '\n' + val;
                    }
                }*/
                const dataActor = $(value).find('table');
                dataActor.map(function (i: any, value: any) {
                    if ($(value).find('tbody > tr > td > .picSurround > a').attr('href') != null) {
                        if (String($(value).find('tbody > tr > td > div > small').text()).includes('Japanese')) {
                            id_actor = Number(String($(value).find('tbody > tr > td > .picSurround > a').attr('href')).split('people/')[1].split('/')[0]);
                            name_actor = $(value).find('tbody > tr > td > a').html();
                            url_imgActor = $(value).find('tbody > tr > td > .picSurround > a > img').attr('data-src');
                            url_pageActor = $(value).find('tbody > tr > td > a').attr('href');
                        }
                    }
                });
            }
        });
        actor = { id: id_actor, name: name_actor, url_img: url_imgActor, url_page: url_pageActor };
        const description = await translate(descriptionNT, "es")
        const character_full: CharacterFull = { id, name, url_page, url_img, age, birthday, blood_type, height, description, actor };
        return character_full;
    } catch (error) {
        console.log(error)
    }
}

export async function getCharacters(url: string) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const dataC = $('.js-anime-character-table');
        const characters: Character[] = [];
        dataC.map(function (i: any, value: any) {
            const valId = String($(value).find('table > tbody > tr > td > .spaceit_pad > a').attr('href')).split('/');
            const id = Number(valId[valId.length - 2]);
            const name = $(value).find('table > tbody > tr > td > .spaceit_pad > a > h3').html();
            const url_img = String($(value).find('.picSurround > a > img').attr('data-src')).replace('r/42x62/', '');
            const url_page = $(value).find('.picSurround > a').attr('href');
            var id_actor = 0;
            const dataActor = $(value).find('.js-anime-character-va-lang')
            var name_actor = "";
            var url_imgActor = "";
            var url_pageActor = "";
            var actor: Actor;
            dataActor.map(function(i:any, value:any){
                if(String($(value).text()).includes('Japanese')){
                    const valIdActor = String($(value).find('td > .spaceit_pad > a').attr('href')).split('/');
                    id_actor = Number(valIdActor[valIdActor.length - 2]) | 0;
                    name_actor = $(value).find('td > .spaceit_pad > a').html();
                    url_imgActor = String($(value).find('td > .picSurround > a > img').attr('data-src')).replace('r/42x62/', '');
                    url_pageActor = $(value).find('.js-anime-character-va-lang > td > .picSurround > a').attr('href');
                }
            });
            actor = { id: id_actor, name: name_actor, url_img: url_imgActor, url_page: url_pageActor };
            characters.push({
                id,
                name,
                url_img,
                url_page,
                actor,
            });
        });
        return characters;
    } catch (error) {
        console.log(error)
    }
}