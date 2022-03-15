import { defineNuxtRouteMiddleware, useNuxtApp } from "#app";
import { routeOption, getMatchedComponents, normalizePath } from "../utils/index.mjs";
export default defineNuxtRouteMiddleware(async (to, from) => {
  const ctx = useNuxtApp();
  if (routeOption(to, "auth", false)) {
    return;
  }
  const matches = [];
  const Components = getMatchedComponents(to, matches);
  if (!Components.length) {
    return;
  }
  const { login, callback } = ctx.$auth.options.redirect;
  const pageIsInGuestMode = routeOption(to, "auth", "guest");
  const insidePage = (page) => normalizePath(to.path, ctx) === normalizePath(page, ctx);
  if (ctx.$auth.$state.loggedIn) {
    const { tokenExpired, refreshTokenExpired, isRefreshable } = ctx.$auth.check(true);
    if (!login || insidePage(login) || pageIsInGuestMode) {
      ctx.$auth.redirect("home", { route: to });
    }
    if (refreshTokenExpired) {
      ctx.$auth.reset();
    } else if (tokenExpired) {
      if (isRefreshable) {
        try {
          await ctx.$auth.refreshTokens();
        } catch (error) {
          ctx.$auth.reset();
        }
      } else {
        ctx.$auth.reset();
      }
    }
  } else if (!pageIsInGuestMode && (!callback || !insidePage(callback))) {
    ctx.$auth.redirect("login", { route: to });
  }
});
