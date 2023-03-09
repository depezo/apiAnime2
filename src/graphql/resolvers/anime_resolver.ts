import { getAnimeData, getBanners, getComments, getPictures, setComment, setLikesOrDislikes } from "../../data/anime/anime_data";

const animeResolver = {
    Query: {
        getAnime(root:void, args:any){
            return getAnimeData(args.id,args.hentai_status);
        },
        getPictures(root:void, args:any){
            return getPictures(args.url);
        },
        getComments(root: void, args: any){
            return getComments(args.id);
        },
        getBanners(root: void, args: void){
            return getBanners();
        },
    },
    Mutation: {
        setComment(root:void, args:any){
            return setComment(args.message,args.idUser,args.idAnime);
        },
        setLikesOrDislikes(root:void, args: any){
            return setLikesOrDislikes(args.idUser,args.type,args.idAnime,args.idComment);
        }
    }
}

export default animeResolver;