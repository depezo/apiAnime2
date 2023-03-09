import { getTopAnimes } from "../../data/anime/top_data";

const topResolvers = {
    Query: {
        getTopAnimes(root:void, args:any){
            return getTopAnimes(args.typeAnime,args.page);
        }
    }
}

export default topResolvers;