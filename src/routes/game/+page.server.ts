import type Page from "../+page.svelte";
import type { PageServerLoad } from "../demo/lucia/$types";
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { area, ritual, seed, userVisitedArea } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        console.log("User not found, redirecting to login");
        return redirect(302, '/demo/lucia/login');
    }
    const userId = event.locals.user.id;

    const rituals = await db.select().from(ritual);
    const areas = await db.select()
        .from(area)
        .innerJoin(userVisitedArea, eq(area.id, userVisitedArea.areaId))
        .where(eq(userVisitedArea.userId, userId));
    const seeds = await db.select()
        .from(seed)
        .innerJoin(userVisitedArea, eq(seed.areaId, userVisitedArea.areaId))
        .where(eq(userVisitedArea.userId, userId));

    const seedsOnly = seeds.map(record => record.seed);
    const areasOnly = areas.map(record => record.area);

    // const areas2 = await db.select().from(area);
    // insert random rituals
    // for (let i = 0; i < 10; i++) {
    //     const randomArea = areas2[Math.floor(Math.random() * areas2.length)];
    //     await db.insert(userVisitedArea).values({
    //         id: crypto.randomUUID(),
    //         userId: userId,
    //         areaId: randomArea.id,
    //     });
    //     console.log("Inserted random area", randomArea.id);
    // }
    
    return {
        user: event.locals.user,
        areas: areasOnly,
        rituals: rituals,
        seeds: seedsOnly,
    };
};
