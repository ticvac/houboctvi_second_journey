// src/routes/setup/+page.server.ts
import { db } from '$lib/server/db';
import { area, ritual, seed, userVisibleRituals, userVisitedArea, user, userMushroomCount, mushroom } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { generateHexSpiralPoints } from '$lib/hexGrid.js';
import { generateRandomPoint, generateRandomPoints } from '$lib/randomPoints.js';
import { generateMultipleRandomPoints } from '$lib/multipleRandomPoints';
import { eq } from 'drizzle-orm';


let mushs = [
    {"name": "Hobitovka snovitá", "toxicity": 0.23, "color": "#e6194b"},
    {"name": "Shirská chmurka", "toxicity": 0.47, "color": "#3cb44b"},
    {"name": "Mechová perla", "toxicity": 0.12, "color": "#ffe119"},
    {"name": "Lesní šepotka", "toxicity": 0.89, "color": "#0082c8"},
    {"name": "Podhorská bublina", "toxicity": 0.34, "color": "#f58231"},
    {"name": "Zářící nočnice", "toxicity": 0.56, "color": "#911eb4"},
    {"name": "Kouzelná plodnice", "toxicity": 0.78, "color": "#46f0f0"},
    {"name": "Středozemská duhovka", "toxicity": 0.05, "color": "#f032e6"},
    {"name": "Hvězdná houbička", "toxicity": 0.91, "color": "#d2f53c"},
    {"name": "Květinová radost", "toxicity": 0.66, "color": "#fabebe"},
    {"name": "Jantarový zázrak", "toxicity": 0.28, "color": "#008080"},
    {"name": "Hobití záře", "toxicity": 0.73, "color": "#e6beff"},
    {"name": "Kouzelná baňka", "toxicity": 0.15, "color": "#aa6e28"},
    {"name": "Podzimní stínka", "toxicity": 0.44, "color": "#fffac8"},
    {"name": "Zahradní tajemství", "toxicity": 0.62, "color": "#800000"},
    {"name": "Ranní kapka", "toxicity": 0.37, "color": "#aaffc3"},
    {"name": "Stříbrná mlhovka", "toxicity": 0.99, "color": "#808000"},
    {"name": "Noční posvátnost", "toxicity": 0.50, "color": "#ffd8b1"},
    {"name": "Kouzelná hvězda", "toxicity": 0.81, "color": "#000080"},
    {"name": "Podivná záře", "toxicity": 0.09, "color": "#808080"}
];
  

export const load = async (event) => {
    // delete all areas
    await db.delete(userMushroomCount).execute();
    await db.delete(userVisibleRituals).execute();
    await db.delete(userVisitedArea).execute();
    await db.delete(ritual).execute();
    await db.delete(seed).execute();
    await db.delete(area).execute();
    await db.delete(mushroom).execute();
    // set users seeds collected to 0
    const users = await db.select().from(user);
    for (const userm of users) {
        await db.update(user).set({ seedsCollected: 0 }).where(eq(user.id, userm.id)).execute();
    }
    // creating mushrooms
    for (const mush of mushs) {
        await db.insert(mushroom).values({
            id: crypto.randomUUID(),
            name: mush.name,
            toxicity: mush.toxicity,
            color: mush.color
        });
    }

    // creating new areas
    let distance = 200;
    let radius = 160;
    let howMany = 22;

    let center: [number, number] = [50.7004203, 15.4772036];
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