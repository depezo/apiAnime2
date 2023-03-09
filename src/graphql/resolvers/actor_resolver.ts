import { getActor } from "../../data/anime/actor_data";

const actorResolver = {
    Query: {
        getActor(root:void, args:any){
            return getActor(args.id);
        }
    }
}

export default actorResolver;