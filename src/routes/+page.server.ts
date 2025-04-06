import { db } from '$lib/server/db';
import { area, ritual, seed, userVisitedArea, user, locationEntry } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq, and, type SQLWrapper, desc } from 'drizzle-orm';


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

    let posledni_pozice = [];
    
    const our_users = await db.select().from(user);
    for (const u of our_users) {
        const logs = await db.select().from(locationEntry).where(eq(locationEntry.userId, u.id)).orderBy(desc(locationEntry.time)).limit(1);
        if (logs.length == 0) {
            continue;
        }
        console.log("user ----" , u.username);
        console.log("logs ----" , logs.length);
        const d = new Date(logs[0].time)
        // get last by
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          };
        const formattedDate = d.toLocaleString("cs-CZ", options);

        console.log(formattedDate);
        posledni_pozice.push({
            username: u.username,
            lat: logs[0].lat,
            lon: logs[0].lon,
            time: formattedDate,
        });
    }


    return {
        areas,
        rituals,
        seeds,
        posledni_pozice
    };
}