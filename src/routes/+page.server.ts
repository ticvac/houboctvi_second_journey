import { db } from '$lib/server/db';
import { area, ritual, seed, userVisitedArea } from '$lib/server/db/schema';

export const load = async (event) => {
    const areas = await db.select().from(area);
    const rituals = await db.select().from(ritual);
    const seeds = await db.select().from(seed);
    console.log('areas ----' , areas.length);
    console.log("aaaaa - ")
    return {
        areas,
        rituals,
        seeds,
    };
}