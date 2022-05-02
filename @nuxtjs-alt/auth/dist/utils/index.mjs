export const isUnset = (o) => typeof o === "undefined" || o === null;
export const isSet = (o) => !isUnset(o);
export const isSameURL = (ctx, a, b) => normalizePath(a, ctx) === normalizePath(b, ctx);
export function isRelativeURL(u) {
  return u && u.length && new RegExp([
    "^\\/([a-zA-Z0-9@\\-%_~.:]",
    "[/a-zA-Z0-9@\\-%_~.:]*)?",
    "([?][^#]*)?(#[^#]*)?$"
  ].join("")).test(u);
}
export function parseQuery(queryString) {
  const query = {};
  const pairs = queryString.split("&");
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}
export function encodeQuery(queryObject) {
  return Object.entries(queryObject).filter(([_key, value]) => typeof value !== "undefined").map(([key, value]) => encodeURIComponent(key) + (value != null ? "=" + encodeURIComponent(value) : "")).join("&");
}
export function routeOption(route, key, value) {
  return route.matched.some((m) => m.meta[key] === value);
}
export function getMatchedComponents(route, matches = []) {
  return [].concat(...[], ...route.matched.map(function(m, index) {
    return Object.keys(m.components).map(function(key) {
      matches.push(index);
      return m.components[key];
    });
  }));
}
export function normalizePath(path = "", ctx) {
  let result = path.split("?")[0];
  if (ctx && ctx.$config.app.baseURL) {
    result = result.replace(ctx.$config.app.baseURL, "/");
  }
  if (result.charAt(result.length - 1) === "/") {
    result = result.slice(0, -1);
  }
  result = result.replace(/\/+/g, "/");
  return result;
}
export function encodeValue(val) {
  if (typeof val === "string") {
    return val;
  }
  return JSON.stringify(val);
}
export function decodeValue(val) {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (_) {
    }
  }
  return val;
}
export function getProp(holder, propName) {
  if (!propName || !holder || typeof holder !== "object") {
    return holder;
  }
  if (propName in holder) {
    return holder[propName];
  }
  const propParts = Array.isArray(propName) ? propName : (propName + "").split(".");
  let result = holder;
  while (propParts.length && result) {
    result = result[propParts.shift()];
  }
  return result;
}
export function addTokenPrefix(token, tokenType) {
  if (!token || !tokenType || typeof token !== "string" || token.startsWith(tokenType)) {
    return token;
  }
  return tokenType + " " + token;
}
export function removeTokenPrefix(token, tokenType) {
  if (!token || !tokenType || typeof token !== "string") {
    return token;
  }
  return token.replace(tokenType + " ", "");
}
export function urlJoin(...args) {
  return args.join("/").replace(/[/]+/g, "/").replace(/^(.+):\//, "$1://").replace(/^file:/, "file:/").replace(/\/(\?|&|#[^!])/g, "$1").replace(/\?/g, "&").replace("&", "?");
}
export function cleanObj(obj) {
  for (const key in obj) {
    if (obj[key] === void 0) {
      delete obj[key];
    }
  }
  return obj;
}
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export function randomString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
