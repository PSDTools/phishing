import { page, type PageResponse } from "fresh";
import { define } from "../utils.ts";
import { getCookies, setCookie } from "@std/http/cookie";
import { db } from "../utils/db.ts";

const key = ["clicks", "main"];

export const handler = define.handlers({
  GET: async (ctx): Promise<PageResponse<{ clicks: number }>> => {
    const cookie = getCookies(ctx.req.headers)["Clicked"];

    const clicksRes = await db.get<number>(key).catch(() => undefined);

    if (cookie === undefined) {
      if (clicksRes !== undefined) {
        await db.atomic().check(clicksRes).set(
          key,
          clicksRes.value! + 1,
        ).commit();
      } else {
        await db.set(key, 1);
      }
    }

    const headers = new Headers();

    if (ctx.config.mode === "production") {
      setCookie(headers, { name: "Clicked", value: "true", path: "/" });
    }

    return page({
      clicks: clicksRes === undefined
        ? 0
        : cookie === undefined
        ? clicksRes.value! + 1
        : clicksRes.value!,
    }, { headers });
  },
});

function formatNumber(num: number): string {
  if (num >= 10 && num < 20) {
    return `${num}th`;
  }

  switch (num % 10) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;

    default:
      return `${num}th`;
  }
}

export default define.page<typeof handler>(function Home({ data }) {
  return (
    <div class="m-auto fresh-gradient">
      <div class="mx-auto flex h-screen max-w-screen-md flex-col items-center justify-center px-4 py-8">
        <p class="my-4">
          You're the {formatNumber(data.clicks)} person to be Phished!
          <br />
          Click <a href="/insecure">here</a> to learn more about cybersecurity.
        </p>
      </div>
    </div>
  );
});
