import { getAnimesSeason } from "../../data/anime/season_data";

const seasonResolver = {
    Query: {
        getAnimesSeason(root:void, args:any){
            return getAnimesSeason(args.year,args.season);
        }
    }
}

export default seasonResolver;