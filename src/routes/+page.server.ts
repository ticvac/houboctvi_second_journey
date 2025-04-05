import { db } from '$lib/server/db';
import { area, ritual, seed, userVisitedArea } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';


export const load = async (event) => {
    if (!event.locals.user) {
        console.log("User not found, redirecting to login");
        return redirect(302, '/demo/lucia/login');
    }
    console.log("user ----" , event.locals.user);
    if (event.locals.user.username != "user") {
        console.log("user not admin");
        return redirect(302, '/demo/lucia/login');
    }

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