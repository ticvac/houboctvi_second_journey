import { db } from '$lib/server/db';
import { mushroom } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq, and, type SQLWrapper } from 'drizzle-orm';


export const load = async (event) => {
    if (!event.locals.user) {
        console.log("User not found, redirecting to login");
        return redirect(302, '/demo/lucia/login');
    }
    if (event.locals.user.username != "user") {
        console.log("user not admin");
        return redirect(302, '/demo/lucia/login');
    }

    let mushroomId = event.params.mushroom_id;
    const mmm = await db.select().from(mushroom).where(eq(mushroom.id, mushroomId));
    return {
        "mushroom": mmm[0],
    };
};