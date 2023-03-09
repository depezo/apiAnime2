import { getCharacters, getCharacter } from "../../data/anime/character_data";

const charactersResolver = {
    Query: {
        getCharacters(root:void, args:any){
            return getCharacters(args.url);
        },
        getCharacter(root:void, args: any){
            return getCharacter(args.id);
        }
    }
}

export default charactersResolver;