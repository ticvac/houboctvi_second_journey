// src/routes/setup/+page.server.ts
import { db } from '$lib/server/db';
import { area, ritual, seed, userVisibleRituals, userVisitedArea, user, userMushroomCount, mushroom, userAlmanachAccess, locationEntry } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { generateHexSpiralPoints } from '$lib/hexGrid.js';
import { generateRandomPoint, generateRandomPoints } from '$lib/randomPoints.js';
import { generateMultipleRandomPoints } from '$lib/multipleRandomPoints';
import { eq } from 'drizzle-orm';


let mushs = [
    {"file_name": "palivka_rychlocasa.png", "name": "Pálivka Rychločasá", "toxicity": 0.01, "color": "#ff0000", "text": "Velmi zvláštní houba. Poznáte ji díky jejímu ohnivému vzhledu. Kloubouk i nohu má rudou a pokud ji promnete v rukou, ucítíte mírné teplo.\n\nJe těžké narazit na čerstvou Pálivku Rychločasou. Vyroste a zplesniví během několika hodin. Odhodlaní houbaři vyrážejí do lesů hned, jak skončí letní či jarní deštík a hledají čerstvě vyrostlé „Rychlovky“, jak jim někteří přezdívají. Tento název se pravděpodobně poprvé začal používat v Hůrce, kde Dorli Bulidor, místní hobit mastičkář, poprvé zkusil Rychlovku velmi rychle nadrtit a poté smíchat s čerstvým býlím.\n\nUkázalo se, že bylinky, které by se musely sušit dlouhé týdny se téměř okamžitě usušily, zatímco Rychlovka se prakticky celá vlastním teplem vypařila. Rychlovka se tak začala používat ne na jídlo, ve kterém sice nezpůsobovala žádné neblahé zdravotní problémy, pouze nechutnou trpkou chuť, a začala se používat na rychlé sušení jakékoliv byliny či houby."},
    {"file_name": "name", "name": "Hobitovka snovitá", "toxicity": 0.23, "color": "#e6194b", "text": "empty"},
    {"file_name": "name", "name": "Shirská chmurka", "toxicity": 0.47, "color": "#3cb44b", "text": "empty"},
    {"file_name": "name", "name": "Mechová perla", "toxicity": 0.12, "color": "#ffe119", "text": "empty"},
    {"file_name": "name", "name": "Lesní šepotka", "toxicity": 0.89, "color": "#0082c8", "text": "empty"},
    {"file_name": "name", "name": "Podhorská bublina", "toxicity": 0.34, "color": "#f58231", "text": "empty"},
    {"file_name": "name", "name": "Zářící nočnice", "toxicity": 0.56, "color": "#911eb4", "text": "empty"},
    {"file_name": "name", "name": "Kouzelná plodnice", "toxicity": 0.78, "color": "#46f0f0", "text": "empty"},

];
  

export const load = async (event) => {
    if (!event.locals.user) {
        console.log("User not found, redirecting to login");
        return redirect(302, '/demo/lucia/login');
    }
    if (event.locals.user.username != "user") {
        console.log("user not admin");
        return redirect(302, '/demo/lucia/login');
    }

    // delete all areas
    await db.delete(locationEntry).execute();
    await db.delete(userAlmanachAccess).execute();
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
            file_name: mush.file_name,
            toxicity: mush.toxicity,
            color: mush.color,
            info: mush.text,
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