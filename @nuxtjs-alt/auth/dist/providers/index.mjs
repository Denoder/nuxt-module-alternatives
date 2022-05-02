export * from "./auth0.mjs";
export * from "./discord.mjs";
export * from "./facebook.mjs";
export * from "./github.mjs";
export * from "./google.mjs";
export * from "./laravel-jwt.mjs";
export * from "./laravel-passport.mjs";
export * from "./laravel-sanctum.mjs";
export const ProviderAliases = {
  "laravel/jwt": "laravelJWT",
  "laravel/passport": "laravelPassport",
  "laravel/sanctum": "laravelSanctum"
};
