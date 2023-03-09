import { getGenresAnimes } from "../../data/anime/genres_data";

const genresResolver = {
    Query: {
        getGenresAnimes(root:void,args:any){
            return getGenresAnimes(args.id,args.page);
        }
    }
}

export default genresResolver;