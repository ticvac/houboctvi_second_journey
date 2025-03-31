import { db } from '$lib/server/db';
import { mushroom, userMushroomCount } from '$lib/server/db/schema.js';
import { eq, sql, and } from 'drizzle-orm';

export const load = async (event) => {
    const mmm = await db
  .select({
    id: mushroom.id,
    name: mushroom.name,
    toxicity: mushroom.toxicity,
    color: mushroom.color,
    userCount: sql<number>`COALESCE(COUNT(${userMushroomCount.mushroomId}), 0)`
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
    }
        
    return {
        almanach: mmm,
    };
};