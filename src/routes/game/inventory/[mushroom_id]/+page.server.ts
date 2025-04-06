import { db } from '$lib/server/db';
import { mushroom, userAlmanachAccess } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq, and, type SQLWrapper } from 'drizzle-orm';


export const load = async (event) => {
    if (!event.locals.user) {
        console.log("User not found, redirecting to login");
        return redirect(302, '/demo/lucia/login');
    }
    // TODO check if can see this mushroom

    let mushroomId = event.params.mushroom_id;
    const mmm = await db.select().from(mushroom).where(eq(mushroom.id, mushroomId));
    let access = await db.select().from(userAlmanachAccess)
    .where(and(
        eq(userAlmanachAccess.userId, event.locals.user!.id),
        eq(userAlmanachAccess.mushroomId, mushroomId)
    ));
    
    return {
        "mushroom": mmm[0],
        "info": mmm[0].info.replaceAll("\n", "<br>"),
        "can_access": access.length > 0 ? true : false,
    };
};