import type Page from "../+page.svelte";
import type { PageServerLoad } from "../demo/lucia/$types";
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { area, ritual, seed, userVisitedArea, userVisibleRituals, user, mushroom, userMushroomCount, userAlmanachAccess, type Mushroom, locationEntry } from '$lib/server/db/schema';
import { eq, and, type SQLWrapper, desc } from 'drizzle-orm';

function haversineDistance(lat1:number, lon1:number, lat2:number, lon2:number) {
	const R = 6371; // Radius of the Earth in kilometers
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
		Math.sin(dLon / 2) ** 2;
		
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function toRad(degrees:number) {
	return degrees * (Math.PI / 180);
}



export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        console.log("User not found, redirecting to login");
        return redirect(302, '/demo/lucia/login');
    }
    const userId = event.locals.user.id;

    const rituals = await db.select()
        .from(ritual)
        .innerJoin(userVisibleRituals, eq(ritual.id, userVisibleRituals.ritualId))
        .where(eq(userVisibleRituals.userId, userId));
    const areas = await db.select()
        .from(area)
        .innerJoin(userVisitedArea, eq(area.id, userVisitedArea.areaId))
        .where(eq(userVisitedArea.userId, userId));
    const seeds = await db.select()
        .from(seed)
        .innerJoin(userVisitedArea, eq(seed.areaId, userVisitedArea.areaId))
        .where(eq(userVisitedArea.userId, userId));

    const ritualsOnly = rituals.map(record => record.ritual);
    const seedsOnly = seeds.map(record => record.seed);
    const areasOnly = areas.map(record => record.area);

    const Iuser = await db.select()
    .from(user)
    .where(eq(user.id, event.locals.user!.id)); 

    
    return {
        should_reset: event.locals.user.username == "user",
        user: event.locals.user,
        areas: areasOnly,
        rituals: ritualsOnly,
        seeds: seedsOnly,
        seedsCollected: Iuser[0].seedsCollected,
    };
};

const distanceToSeeRituals = 0.5;
const distanceToPerformRituals = 0.03;
const distanceToCollectSeeds = 0.03;

export const actions = {
    positionUpdate: async (event) => {
        console.log("Action called");
        const data = await event.request.formData();
        const lat = parseFloat(data.get('lat') as string) || 0;
        const lon = parseFloat(data.get('lon') as string) || 0;
        // save location entry
        await db.insert(locationEntry).values({
            id: crypto.randomUUID(),
            userId: event.locals.user!.id,
            lat: lat,
            lon: lon,
        });
        // unlock rituals
        const rituals = await db.select()
            .from(ritual)
        for (const ritual of rituals) {
            let distance = haversineDistance(lat, lon, ritual.lat, ritual.lon);
            // unlocking ritual
            if (distance < distanceToSeeRituals) {
                // check if ritual is already unlocked
                const alreadyUnlocked = await db.select()
                    .from(userVisibleRituals)
                    .where(and(
                        eq(userVisibleRituals.userId, event.locals.user!.id),
                        eq(userVisibleRituals.ritualId, ritual.id)
                    ));
                if (alreadyUnlocked.length === 0) {
                    // console.log("Unlocking ritual", ritual.id);
                    await db.insert(userVisibleRituals).values({
                        id: crypto.randomUUID(),
                        userId: event.locals.user!.id,
                        ritualId: ritual.id,
                    });
                }
            }

            // distance to perform ritual - unlocking area
            if (distance < distanceToPerformRituals) {
                console.log("Performing ritual", ritual.id);
                // check if ritual is already performed
                const alreadyPerformed = await db.select()
                    .from(userVisitedArea)
                    .where(and(
                        eq(userVisitedArea.userId, event.locals.user!.id),
                        eq(userVisitedArea.areaId, ritual.areaId)
                    ));
                if (alreadyPerformed.length === 0) {
                    await db.insert(userVisitedArea).values({
                        id: crypto.randomUUID(),
                        userId: event.locals.user!.id,
                        areaId: ritual.areaId,
                    });
                };
            }
            
        }
        // collecting seeds from areas that are visited
        const areas = await db.select()
        .from(area)
        .innerJoin(userVisitedArea, eq(area.id, userVisitedArea.areaId))
        .where(eq(userVisitedArea.userId, event.locals.user!.id));
        const areasOnly = areas.map(record => record.area);
        for (const area of areasOnly) {
            let seeds = await db.select().from(seed).where(eq(seed.areaId, area.id));
            for (const myseed of seeds) {
                let seedDistance = haversineDistance(lat, lon, myseed.lat, myseed.lon);
                if (seedDistance < distanceToCollectSeeds) {
                    console.log("Collecting seed", myseed.id);
                    await db.delete(seed).where(eq(seed.id, myseed.id));
                    const Iuser = await db.select().from(user).where(eq(user.id, event.locals.user!.id));
                    const me = Iuser[0];
                    // jak casto najdou stranku
                    const eee = await db.select().from(userAlmanachAccess)
                    .where(
                        eq(userAlmanachAccess.userId, me.id),
                    );
                    if (Math.random() > 0.75 && eee.length != 16) {
                        console.log("almanaaaach")
                        const mushrooms = await db.select().from(mushroom);
                        while(true) {
                            // check if exits
                            let one_mushroom = mushrooms[Math.floor(Math.random() * mushrooms.length)]
                            let does_exists = await db.select().from(userAlmanachAccess)
                                .where(and(
                                    eq(userAlmanachAccess.userId, me.id),
                                    eq(userAlmanachAccess.mushroomId, one_mushroom.id)
                                ));
                            if (does_exists.length == 0) {
                                await db.insert(userAlmanachAccess).values({
                                    id: crypto.randomUUID(),
                                    userId: me.id,
                                    mushroomId: one_mushroom.id
                                });
                                break;
                            }
                        }

                    } else { // nasel houbu

                        await db.update(user).set({
                            seedsCollected: (me.seedsCollected ?? 0) + 1,
                        }).where(eq(user.id, event.locals.user!.id));
                        // add random mushroom to user
                        const mushrooms = await db.select().from(mushroom).orderBy(mushroom.rarity);
                        const aaaaa = 30;
                        const totalRarity = mushrooms.reduce((acc, m) => acc + (aaaaa - m.rarity), 0);

                        let rozdeleni:number[] = []
                        for (let i = 0; i < mushrooms.length; i++) {
                            const m = mushrooms[i];
                            if (rozdeleni.length == 0) {
                                console.log((aaaaa - m.rarity) / totalRarity)
                                rozdeleni.push((aaaaa - m.rarity) / totalRarity)
                            } else {
                                rozdeleni.push((aaaaa - m.rarity) / totalRarity + rozdeleni[i-1])
                            }
                        }
                        let randomMushroom = mushrooms[Math.floor(Math.random() * mushrooms.length)];

                        const value = Math.random()
                        let k = 0;
                        while(true) {
                            if (value < rozdeleni[k]) {
                                randomMushroom = mushrooms[k];
                                break;
                            }
                            k++
                        }

                        
                        
                        
                        
                        // check if mushroom is already in userMushroomCount
                        const alreadyHasMushroom = await db.select()
                            .from(userMushroomCount)
                            .where(and(
                                eq(userMushroomCount.userId, event.locals.user!.id),
                                eq(userMushroomCount.mushroomId, randomMushroom.id)
                            ));
                        if (alreadyHasMushroom.length == 0) {
                            await db.insert(userMushroomCount).values({
                                id: crypto.randomUUID(),
                                userId: event.locals.user!.id,
                                mushroomId: randomMushroom.id,
                                count: 1,
                            });
                        } else {
                            await db.update(userMushroomCount).set({
                                count: (alreadyHasMushroom[0].count ?? 0) + 1,
                            }).where(and(
                                eq(userMushroomCount.userId, event.locals.user!.id),
                                eq(userMushroomCount.mushroomId, randomMushroom.id)
                            ));
                        }

                    }
                }
            }
        }

        // load rituals
        const rrr = await db.select()
            .from(ritual)
            .innerJoin(userVisibleRituals, eq(ritual.id, userVisibleRituals.ritualId))
            .where(eq(userVisibleRituals.userId, event.locals.user!.id));
        const ritualsOnly = rrr.map(record => record.ritual);
        // load areas
       
        const seeds = await db.select()
            .from(seed)
            .innerJoin(userVisitedArea, eq(seed.areaId, userVisitedArea.areaId))
            .where(eq(userVisitedArea.userId, event.locals.user!.id));
        const seedsOnly = seeds.map(record => record.seed);
        
        const Iuser = await db.select()
            .from(user)
            .where(eq(user.id, event.locals.user!.id));
        
        
        return {
            
            rituals: ritualsOnly,
            areas: areasOnly,
            seeds: seedsOnly,
            lat: lat,
            lon: lon,
            seedsCollected: Iuser[0].seedsCollected,
        }
    },
    resetUserProgress: async (event) => {
        console.log("Resetting user progress");
        const userId = event.locals.user!.id;
        await db.update(user).set({
            seedsCollected: 0,
        }).where(eq(user.id, userId));
        // delete all user visible rituals
        await db.delete(locationEntry).where(eq(locationEntry.userId, userId));
        await db.delete(userAlmanachAccess).where(eq(userAlmanachAccess.userId, userId))
        await db.delete(userVisibleRituals).where(eq(userVisibleRituals.userId, userId));
        // delete all user visited areas
        await db.delete(userVisitedArea).where(eq(userVisitedArea.userId, userId));
        // delete all user seeds
        await db.delete(userMushroomCount).where(eq(userMushroomCount.userId, userId));
        // delete all seeds
        return {
            success: true,
        }
    }
}