import { getLetterAnimes, getSearchAnimes } from "../../data/anime/search_data";

const searchResolver = {
    Query: {
        getSearchAnimes(root:void,args:any){
            return getSearchAnimes(args.request,args.page,args.hentai_status);
        },
        getLetterAnimes(root:void,args:any){
            return getLetterAnimes(args.letter,args.page);
        }
    }
}

export default searchResolver;