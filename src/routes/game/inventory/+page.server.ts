import { db } from '$lib/server/db';
import { mushroom, userMushroomCount, userAlmanachAccess } from '$lib/server/db/schema.js';
import { eq, sql, and } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';


export const load = async (event) => {
  if (!event.locals.user) {
      console.log("User not found, redirecting to login");
      return redirect(302, '/demo/lucia/login');
  }

    const mmm = await db
  .select({
    id: mushroom.id,
    name: mushroom.name,
    toxicity: mushroom.toxicity,
    color: mushroom.color,
    file_name: mushroom.file_name,
    userCount: sql<number>`COALESCE(COUNT(${userMushroomCount.mushroomId}), 0)`,
    can_access: sql<boolean>`false`,
  })
  .from(mushroom)
  .leftJoin(
    userMushroomCount,
    and(
      eq(mushroom.id, userMushroomCount.mushroomId),
      eq(userMushroomCount.userId, event.locals.user!.id)
    )
  )
  .groupBy(mushroom.id)
  .having(sql`COUNT(${userMushroomCount.mushroomId}) > 0`);

    for (let i = 0; i < mmm.length; i++) {
        let count = await db
            .select()
            .from(userMushroomCount)
            .where(
                and(
                    eq(userMushroomCount.userId, event.locals.user!.id),
                    eq(userMushroomCount.mushroomId, mmm[i].id)
                )
            );
        mmm[i].userCount = count[0].count ?? 0;
        let access = await db.select().from(userAlmanachAccess)
        .where(and(
            eq(userAlmanachAccess.userId, event.locals.user!.id),
            eq(userAlmanachAccess.mushroomId, mmm[i].id)
        ));
        mmm[i].can_access = access.length > 0 ? true : false;
    }
        
    return {
        almanach: mmm,
    };
};