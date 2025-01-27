import { page, type PageResponse } from "fresh";
import { define } from "../utils.ts";
import { getCookies, setCookie } from "@std/http/cookie";

const db = await Deno.openKv();

const key = ["clicks", "insecure"];

export const handler = define.handlers({
  GET: async (ctx): Promise<PageResponse<{ clicks: number }>> => {
    const cookie = getCookies(ctx.req.headers)["Clicked-Insecure"];

    let clicksRes;

    try {
      clicksRes = await db.get<number>(key);
    } catch {
      await db.atomic().set(key, 0).commit();
      clicksRes = await db.get<number>(key);
    }

    if (cookie === undefined) {
      await db.atomic().check(clicksRes).set(
        key,
        clicksRes.value! + 1,
      ).commit();
    }

    const headers = new Headers();

    if (ctx.config.mode === "production") {
      setCookie(headers, {
        name: "Clicked-Insecure",
        value: "true",
        path: "/",
      });
    }

    return page({
      clicks: cookie === undefined ? clicksRes.value! + 1 : clicksRes.value!,
    }, {
      headers,
    });
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
          Ha Ha! Don’t click sus links.
          <br />
          You're the {formatNumber(data.clicks)} person to be double-Phished!
          <br />
          This one’s safe, I promise.
          Click<a href="https://consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams">
            here
          </a>{" "}
          to actually learn more about cybersecurity. You can also take{" "}
          <a href="https://phishingquiz.withgoogle.com/">this quiz</a>
          to try to spot more phishing.
        </p>
      </div>
    </div>
  );
});
