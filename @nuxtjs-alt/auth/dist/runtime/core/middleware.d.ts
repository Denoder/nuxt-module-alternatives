import type { RouteLocationNormalized } from "vue-router";
declare const middleware: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void;
export { middleware as AuthMiddleware, middleware as default };
