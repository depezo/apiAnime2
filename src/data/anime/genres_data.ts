import { getDataAnimeSeason } from "./season_data";

export interface Genre {
    id: number
    description: string
}

export async function getGenresAnimes(id:number,page:string){
    const url = "https://myanimelist.net/anime/genre/" + id + "?page=" + page;
    return getDataAnimeSeason(url);
}