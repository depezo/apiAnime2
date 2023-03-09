import { getChats, sendMessage, sendTypeMessage } from "../../data/chat/general_chat_data"

const chatResolver = {
    Query: {
        getChats(root: void, args: any){
            return getChats();
        }
    },
    Mutation: {
        sendMessage(root:void, args:any){
            return sendMessage(args.message,args.user);
        },
        sendTypeMessage(root: void, args:any){
            return sendTypeMessage(args.message, args.user, args.type);
        }
    }
}

export default chatResolver;