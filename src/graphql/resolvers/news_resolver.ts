import { getAllNews, getNews, getNewsByProducer, getNewsByTag } from "../../data/anime/news_data"

const newsResolver = {
    Query: {
        getNews(root: void, args: any){
            return getNews(args.id);
        },
        getAllNews(root:void, args: any){
            return getAllNews(args.page);
        },
        getNewsByTag(root:void, args: any){
            return getNewsByTag(args.tag, args.page);
        },
        getNewsByProducer(root:void, args: any){
            return getNewsByProducer(args.url);
        }
    }
}

export default newsResolver;