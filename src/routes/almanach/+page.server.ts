import { db } from '$lib/server/db';
import { mushroom } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';


export const load = async (event) => {
    if (!event.locals.user) {
        console.log("User not found, redirecting to login");
        return redirect(302, '/demo/lucia/login');
    }
    if (event.locals.user.username != "user") {
        console.log("user not admin");
        return redirect(302, '/demo/lucia/login');
    }

    const mmm = await db.select().from(mushroom);
    console.log('mushroom ----' , mmm.length);
    return {
        almanach: mmm,
    };
};