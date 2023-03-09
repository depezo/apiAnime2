import { getAllEmisionDub, getLastEpisodeUploaded, getWeekdayEmisionDub, setLastEpisodeUploaded, updateHourEpisode, updateStatusEpisode, updateWeekdayEpisode } from "../../data/players/episodes_data";
import { getHEpisodes } from "../../data/players/h_players_data";
import { getLatEpisodes } from "../../data/players/lat_players_data";
import { getSubEpisodes } from "../../data/players/sub_players_data";

const episodeResolver = {
    Query : {
        getSubEpisodes(root:void,args:any){
            return getSubEpisodes(args.name,args.episode,args.idAnime,args.isDebug);
        },
        getLatEpisodes(root:void,args:any){
            return getLatEpisodes(args.name,args.episode,args.idAnime,args.isDebug);
        },
        getHEpisodes(root:void,args:any){
            return getHEpisodes(args.name,args.episode);
        },
        getLastEpisodeUploaded(root:void,args:any){
            return getLastEpisodeUploaded(args.idAnime,args.isDebug); 
        },
        getAllEmisionDub(root: void, args: any){
            return getAllEmisionDub();
        },
        getWeekdayEmisionDub(root: void, args: any){
            return getWeekdayEmisionDub(args.weekday);
        }
    },
    Mutation: {
        setLastEpisodeUploaded(root: void, args: any){
            return setLastEpisodeUploaded(args.tinyAnime,args.nameEpisode,args.url_img,args.episode,args.language,args.episodes);
        },
        updateWeekdayEpisode(root: void, args: any){
            return updateWeekdayEpisode(args.idAnime, args.weekday, args.language);
        },
        updateHourEpisode(root: void, args: any){
            return updateHourEpisode(args.idAnime, args.hour, args.minute, args.language);
        },
        updateStatusEpisode(root: void, args: any){
            return updateStatusEpisode(args.idAnime, args.status, args.language);
        }
    }
}

export default episodeResolver;