import { migrateTest } from "../../data/migrate/migrate_rt_to_ft"


const migrateResolver = {
    Query: {
        getMigrateTest(){
            return migrateTest();
        }
    }
}

export default migrateResolver;