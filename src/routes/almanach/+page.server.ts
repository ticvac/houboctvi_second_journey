import { db } from '$lib/server/db';
import { mushroom } from '$lib/server/db/schema.js';

export const load = async (event) => {
    const mmm = await db.select().from(mushroom);
    console.log('mushroom ----' , mmm.length);
    return {
        almanach: mmm,
    };
};