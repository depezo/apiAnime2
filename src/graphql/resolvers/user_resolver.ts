import { createUser, getAnimesFav, getEpisodesW, getRoles, getTypeImages, setEpisodesW, setFinishedAnime, setLastViewed, updateAnimesFav, updateGif, updatePhoto, updateRol, updateUsername } from "../../data/user/user_data";

const userResolver = {
    Query: {
        getEpisodesW(root:void, args: any){
            return getEpisodesW(args.id,args.idAnime);
        },
        getAnimesFav(root:void, args:any){
            return getAnimesFav(args.id);
        },
        getRoles(root:void, args: any){
            return getRoles();
        },
        getTypesImages(root: void, args: any){
            return getTypeImages();
        }
    },
    Mutation: {
        createUser(root:void, args:any){
            return createUser(args.email,args.id);
        },
        setEpisodesW(root:void, args: any){
            return setEpisodesW(args.id,args.idAnime,args.ew);
        },
        updateUsername(root:void, args:any){
            return updateUsername(args.id,args.username);
        },
        updatePhoto(root: void, args:any){
            return updatePhoto(args.id, args.newPhoto);
        },
        updateAnimesFav(root: void, args: any){
            return updateAnimesFav(args.id,args.anime,args.type);
        },
        setLastViewed(root: void, args: any){
            return setLastViewed(args.id,args.add,args.removeId,args.withRemoved);
        },
        updateGif(root: void, args:any){
            return updateGif(args.id, args.newGif);
        },
        updateRol(root: void, args: any){
            return updateRol(args.id, args.rol);
        },
        setFinishedAnime(root: void, args: any){
            return setFinishedAnime(args.id,args.idAnime);
        }
    }
}

export default userResolver;