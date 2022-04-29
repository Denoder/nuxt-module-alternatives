import { useNuxtApp, defineNuxtRouteMiddleware } from "#app";
import { routeOption, getMatchedComponents, normalizePath } from "../../utils";
import type { RouteLocationNormalized } from "vue-router";

const middleware = defineNuxtRouteMiddleware((
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
) => {
    // Disable middleware if options: { auth: false } is set on the route
    if (routeOption(to, "auth", false)) {
        return;
    }

    // Disable middleware if no route was matched to allow 404/error page
    const matches = [];
    const Components = getMatchedComponents(to, matches);

    if (!Components.length) {
        return;
    }

    const ctx = useNuxtApp();

    const { login, callback } = ctx.$auth.options.redirect;

    const pageIsInGuestMode = routeOption(to, "auth", "guest");

    const insidePage = (page: any) =>
        // @ts-ignore
        normalizePath(to.path, ctx) === normalizePath(page, ctx);

    if (ctx.$auth.$state.loggedIn) {
        // Perform scheme checks.
        const { tokenExpired, refreshTokenExpired, isRefreshable } =
            ctx.$auth.check(true);

        // -- Authorized --
        if (!login || insidePage(login) || pageIsInGuestMode) {
            ctx.$auth.redirect("home", { route: to });
        }

        // Refresh token has expired. There is no way to refresh. Force reset.
        if (refreshTokenExpired) {
            ctx.$auth.reset();
        } else if (tokenExpired) {
            // Token has expired. Check if refresh token is available.
            if (isRefreshable) {
                // Refresh token is available. Attempt refresh.
                try {
                    ctx.$auth.refreshTokens();
                } catch (error) {
                    // Reset when refresh was not successfull
                    ctx.$auth.reset();
                }
            } else {
                // Refresh token is not available. Force reset.
                ctx.$auth.reset();
            }
        }
    }

    // -- Guest --
    // (Those passing `callback` at runtime need to mark their callback component
    // with `auth: false` to avoid an unnecessary redirect from callback to login)
    else if (!pageIsInGuestMode && (!callback || !insidePage(callback))) {
        ctx.$auth.redirect("login", { route: to });
    }
});

export { middleware as AuthMiddleware, middleware as default };
