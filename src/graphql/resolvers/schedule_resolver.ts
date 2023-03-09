import { getScheduleAnimes } from "../../data/anime/schedule_data";

const scheduleResolver = {
    Query: {
        getScheduleAnimes(){
            return getScheduleAnimes();
        }
    }
}

export default scheduleResolver;