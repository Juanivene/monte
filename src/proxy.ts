import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth-token";
import {
  LOCALE_COOKIE,
  defaultLocale,
  hasLocale,
  localeFromAcceptLanguage,
} from "@/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return protectAdmin(request);
  }

  const firstSegment = pathname.split("/")[1];

  // Ya tiene idioma: se recuerda como el elegido, así el selector "queda".
  // Salvo en los prefetch de <Link>: el selector apunta al otro idioma y su
  // prefetch cambiaría la cookie sin que nadie haya hecho click.
  if (hasLocale(firstSegment)) {
    const response = NextResponse.next();
    if (!isPrefetch(request) && request.cookies.get(LOCALE_COOKIE)?.value !== firstSegment) {
      response.cookies.set(LOCALE_COOKIE, firstSegment, {
        path: "/",
        maxAge: ONE_YEAR,
        sameSite: "lax",
      });
    }
    return response;
  }

  // Sin idioma: el último elegido, si no el del navegador, si no inglés.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = hasLocale(cookieLocale)
    ? cookieLocale
    : (localeFromAcceptLanguage(request.headers.get("accept-language")) ?? defaultLocale);

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

function isPrefetch(request: NextRequest) {
  const { headers } = request;
  return (
    headers.has("next-router-prefetch") ||
    headers.get("purpose") === "prefetch" ||
    headers.get("sec-purpose")?.includes("prefetch") === true
  );
}

async function protectAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Todo menos la API, los internos de Next y los archivos estáticos (con extensión).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
