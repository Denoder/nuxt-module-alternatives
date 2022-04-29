import { useNuxtApp, defineNuxtRouteMiddleware } from "#app";
import { routeOption, getMatchedComponents, normalizePath } from "../../utils";
const middleware = defineNuxtRouteMiddleware((to, from) => {
  if (routeOption(to, "auth", false)) {
    return;
  }
  const matches = [];
  const Components = getMatchedComponents(to, matches);
  if (!Components.length) {
    return;
  }
  const ctx = useNuxtApp();
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
          ctx.$auth.refreshTokens();
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
export { middleware as AuthMiddleware, middleware as default };
