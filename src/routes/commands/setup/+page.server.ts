// src/routes/setup/+page.server.ts
import { db } from '$lib/server/db';
import { area, ritual, seed, userVisibleRituals, userVisitedArea, user } from '$lib/server/db/schema';
import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import { generateHexSpiralPoints } from '$lib/hexGrid.js';
import { generateRandomPoint, generateRandomPoints } from '$lib/randomPoints.js';
import { generateMultipleRandomPoints } from '$lib/multipleRandomPoints';
import { eq } from 'drizzle-orm';

export const load = async (event) => {
    // delete all areas
    await db.delete(userVisibleRituals).execute();
    await db.delete(userVisitedArea).execute();
    await db.delete(ritual).execute();
    await db.delete(seed).execute();
    await db.delete(area).execute();
    // set users seeds collected to 0
    const users = await db.select().from(user);
    for (const userm of users) {
        await db.update(user).set({ seedsCollected: 0 }).where(eq(user.id, userm.id)).execute();
    }
    // creating new areas
    let distance = 200;
    let radius = 160;
    let howMany = 22;

    let center = [50.0881, 14.3910];
    // let center: [number, number] = [50.7004203, 15.4772036];
    let areaPoints = generateHexSpiralPoints(center[0], center[1], howMany, distance);
    let ritualPoints = generateRandomPoints(areaPoints, radius);
    let seedPoints = generateMultipleRandomPoints(
        areaPoints,
        radius,
        center,
        {
          baseCount: 0,
          distanceMultiplier: 0.002,
          randomSpread: 0,
        }
    )

    for(let i = 0; i < areaPoints.length; i++) {
        const areaId = crypto.randomUUID();
        await db.insert(area).values({
            id: areaId,
            lat: areaPoints[i][0],
            lon: areaPoints[i][1]
        });
        await db.insert(ritual).values({
            id: crypto.randomUUID(),
            lat: ritualPoints[i][0],
            lon: ritualPoints[i][1],
            areaId: areaId
        });
        seedPoints[i].forEach(async (point) => {
            await db.insert(seed).values({
                id: crypto.randomUUID(),
                lat: point[0],
                lon: point[1],
                areaId: areaId
            });
        });
    }
    const areas = await db.select().from(area);
    console.log('Areas:', areas);
    return {
        areas,
    };
}