import { GraphQLSchema } from "graphql";
import 'graphql-import-node';
import { mergeSchemas } from "@graphql-tools/schema";

//Resolvers
import animeResolver from "./resolvers/anime_resolver";
import charactersResolver from "./resolvers/character_resolver";
import actorResolver from "./resolvers/actor_resolver";
import seasonResolver from "./resolvers/season_resolver";
import topResolvers from "./resolvers/top_resolver";
import searchResolver from "./resolvers/search_resolver";
import genresResolver from "./resolvers/genres_resolver";
import episodeResolver from "./resolvers/episode_resolver";
import scheduleResolver from "./resolvers/schedule_resolver";
import newsResolver from "./resolvers/news_resolver";
import migrateResolver from "./resolvers/migrate_resolver";
import userResolver from "./resolvers/user_resolver";
import chatResolver from "./resolvers/chat_resolver";
import wallpaperResolver from "./resolvers/wallpaper_resolver";
import reviewResolver from "./resolvers/review_resolver";

//Schemas
import anime from "./schemas/anime.graphql";
import genre from "./schemas/genre.graphql";
import character from "./schemas/character.graphql";
import actor from "./schemas/actor.graphql";
import producer from "./schemas/producer.graphql";
import season from "./schemas/season.graphql";
import top from "./schemas/top.graphql";
import search from "./schemas/search.graphql";
import episode from "./schemas/episode.graphql";
import producerResolver from "./resolvers/producerResolver";
import schedule from "./schemas/schedule.graphql";
import news from "./schemas/news.graphql";
import migrate from "./schemas/migrate.graphql";
import user from "./schemas/user.graphql";
import chat from "./schemas/chat.graphql"
import wallpaper from "./schemas/wallpaper.graphql"
import review from "./schemas/review.graphql"

export const schema: GraphQLSchema = mergeSchemas({
    typeDefs: [
        anime,
        genre,
        character,
        actor,
        season,
        producer,
        top,
        search,
        episode,
        schedule,
        news,
        migrate,
        user,
        chat,
        wallpaper,
        review
    ],
    resolvers: [
        animeResolver,
        charactersResolver,
        actorResolver,
        seasonResolver,
        topResolvers,
        searchResolver,
        genresResolver,
        producerResolver,
        episodeResolver,
        scheduleResolver,
        newsResolver,
        migrateResolver,
        userResolver,
        chatResolver,
        wallpaperResolver,
        reviewResolver
    ]
});