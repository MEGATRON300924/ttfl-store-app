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
 * mobile app. Unknown external URLs are never opened as native routes.
 */
export function normalizeTTFLLink(input: string) {
  try {
    const value = input.trim();
    if (!value) return null;

    const url = new URL(value, "ttflstore://app");
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    const isTTFL = url.protocol === APP_SCHEME || (isHttp && url.hostname === APP_HOST);

    if (!isTTFL) return value.startsWith("/") ? value : null;

    let path = url.pathname || "/";
    if (url.protocol === APP_SCHEME && url.hostname && url.hostname !== "app") {
      path = `/${url.hostname}${path}`;
    }

    path = cleanPath(path);

    // Web/native route aliases.
    if (path.startsWith("/products/")) path = path.replace(/^\/products\//, "/product/");
    if (path.startsWith("/store/")) path = path.replace(/^\/store\//, "/vendor/");
    if (path.startsWith("/vendors/")) path = path.replace(/^\/vendors\//, "/vendor/");

    // Order links from the web, email and notifications should land on the
    // authenticated native order screen when possible.
    const orderAlias = path.match(/^\/order\/([^/]+)$/);
    if (orderAlias) return withQuery(`/orders/${encodeURIComponent(decodeURIComponent(orderAlias[1]))}`, url.search);

    // Paystack/web confirmation links can safely land in the native payment
    // status screen. The backend verification endpoint remains unchanged.
    const confirmation = path.match(/^\/orders\/([^/]+)\/confirm$/);
    if (confirmation) {
      const orderNumber = decodeURIComponent(confirmation[1]);
      const params = new URLSearchParams(url.search);
      params.set("orderNumber", orderNumber);
      return `/payment/pending?${params.toString()}`;
    }

    if (path === "/payment/callback" || path === "/payment/success") {
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
