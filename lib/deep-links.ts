const APP_SCHEME = "ttflstore:";
const APP_HOST = "ttflstore.name.ng";

function cleanPath(path: string) {
  const normalized = path.replace(/\/+/g, "/").replace(/^([^/])/, "/$1");
  return normalized.length > 1 ? normalized.replace(/\/$/, "") : "/";
}

function withQuery(pathname: string, search: string) {
  return `${cleanPath(pathname)}${search}`;
}

/**
 * Converts TTFL Store web/custom-scheme links into routes understood by the
 * mobile app. Unknown links are returned unchanged so Expo Router can handle
 * them normally instead of swallowing third-party URLs.
 */
export function normalizeTTFLLink(input: string) {
  try {
    const value = input.trim();
    if (!value) return null;

    const url = new URL(value, "ttflstore://app");
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    const isTTFL = url.protocol === APP_SCHEME || (isHttp && url.hostname === APP_HOST);

    if (!isTTFL) {
      return value.startsWith("/") ? value : null;
    }

    let path = url.pathname || "/";
    if (url.protocol === APP_SCHEME && url.hostname && url.hostname !== "app") {
      path = `/${url.hostname}${path}`;
    }

    path = cleanPath(path);

    // The web marketplace uses plural /products and /store routes while the
    // native app intentionally keeps shorter route names.
    if (path.startsWith("/products/")) path = path.replace(/^\/products\//, "/product/");
    if (path.startsWith("/store/")) path = path.replace(/^\/store\//, "/vendor/");

    // Paystack's existing web callback can safely land in the native payment
    // status screen. The backend verification endpoint remains unchanged.
    const confirmation = path.match(/^\/orders\/([^/]+)\/confirm$/);
    if (confirmation) {
      const orderNumber = decodeURIComponent(confirmation[1]);
      const params = new URLSearchParams(url.search);
      params.set("orderNumber", orderNumber);
      return `/payment/pending?${params.toString()}`;
    }

    if (path === "/payment/callback") {
      return `/payment/pending${url.search}`;
    }

    return withQuery(path, url.search);
  } catch {
    return input.startsWith("/") ? input : null;
  }
}

export function createTTFLDeepLink(path: string) {
  const normalized = normalizeTTFLLink(path) ?? "/";
  return `${APP_SCHEME}//app${normalized}`;
}
