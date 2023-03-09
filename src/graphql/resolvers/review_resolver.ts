import { deleteReview, getBestReviewWeek, getMoreReviewsByAnime, getReviewsByAnime, getReviewsByAnimeV2, getReviewsByUser, getTopReviews, reportReview, setLikeReview, setReview } from "../../data/anime/review_data";

const reviewResolver = {
    Query: {
        getReviewsByAnimeV2(root: void, args: any){
            return getReviewsByAnimeV2(args.id, args.userId, args.filter);
        },
        getMoreReviewsByAnime(root: void, args: any){
            return getMoreReviewsByAnime(args.id, args.lastId,args.filter);
        },
        getReviewsByAnime(root: void, args: any){
            return getReviewsByAnime(args.id);
        },
        getBestReviewWeek(root: void, args: any){
            return getBestReviewWeek();
        },
        getTopReviews(root: void, args: any){
            return getTopReviews();
        },
        getReviewsByUser(root:void, args: any){
            return getReviewsByUser(args.id);
        },
    },
    Mutation: {
        setReview(root: void, args: any){
            return setReview(args.id,args.title,args.description,args.anime);
        },
        setLikeReview(root: void, args: any){
            return setLikeReview(args.idUser,args.type,args.idAnime,args.idReview);
        },
        reportReview(root: void, args: any){
            return reportReview(args.id, args.reason);
        },
        deleteReview(root: void, args: any){
            return deleteReview(args.id, args.idUser);
        }
    }
};

export default reviewResolver;