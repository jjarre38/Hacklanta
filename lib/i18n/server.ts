import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, translate, validLocale } from "./core";

export function pageMetadata(title: string) {
  return { title: translate(validLocale(cookies().get(LOCALE_COOKIE)?.value), title) };
}
