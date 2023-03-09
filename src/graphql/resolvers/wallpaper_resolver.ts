import { getCollectionsByInput, getSectionCollection, getWallpapersOfCollection, publishCollection } from "../../data/wallpaper/collection";
import { getTagsByString, getTopTags } from "../../data/wallpaper/tag";
import { addNewWallpaper, getSectionWallpaper, getSectionsWallpaperHome, getTopWeekWallpapers, getUserAndSections, setLikeOrDislikeWallpaper, incrementDownloadCount, getMostSearchedWallpapers, getWallpaperByInput, getForCheckWallpapers, approveWallpaper } from "../../data/wallpaper/wallpaper";

const wallpaperResolver = {
    Query: {
        getTagsByString(root:void, args:any){
            return getTagsByString(args.input);
        },
        getTopWeekWallpapers(root: void, args: any){
            return getTopWeekWallpapers();
        },
        getSectionsWallpaperHome(root: void, args: any){
            return getSectionsWallpaperHome();
        },
        getSectionWallpaper(root: void, args: any){
            return getSectionWallpaper(args.query,args.userId);
        },
        getSectionCollection(root: void, args: any){
            return getSectionCollection(args.query, args.userId);
        },
        getUserAndSections(root: void, args: any){
            return getUserAndSections(args.userId,args.tags,args.isComingFrom);
        },
        getWallpapersOfCollection(root: void, args: any){
            return getWallpapersOfCollection(args.wallpaperIds)
        },
        getTopTags(root:void,args:any){
            return getTopTags();
        },
        getMostSearchedWallpapers(root: void, args: any){
            return getMostSearchedWallpapers();
        },
        getWallpaperByInput(root: void, args:any){
            return getWallpaperByInput(args.input);
        },
        getForCheckWallpapers(root: void, args: any){
            return getForCheckWallpapers();
        },
        getCollectionsByInput(root: void, args: any){
            return getCollectionsByInput(args.input);
        }
    },
    Mutation: {
        addNewWallpaper(root:void, args: any){
            return addNewWallpaper(args.wallpaper);
        },
        publishCollection(root: void, args: any){
            return publishCollection(args.collection);
        },
        setLikeOrDislikeWallpaper(root: void, args: any){
            return setLikeOrDislikeWallpaper(args.docId, args.userId, args.type, args.isRemoving, args.reference);
        },
        incrementDownloadCount(root: void, args: any){
            return incrementDownloadCount(args.wallpaperId);
        },
        approveWallpaper(root: void, args: any){
            return approveWallpaper(args.idWallpaper,args.status, args.tags);
        }
    }
}

export default wallpaperResolver;