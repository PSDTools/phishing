import { define } from "../../utils.ts";
import { db } from "../../utils/db.ts";

export const handler = define.handlers({
  GET: async (ctx): Promise<Response> => {
    const { link } = await ctx.req.json();

    const key = ["clicks", link];

    const clicksRes = await db.get<number>(key).catch(() => undefined);

    if (clicksRes !== undefined) {
      await db.atomic().check(clicksRes).set(
        key,
        clicksRes.value! + 1,
      ).commit();
    } else {
      await db.set(key, 1);
    }

    return new Response();
  },
});
