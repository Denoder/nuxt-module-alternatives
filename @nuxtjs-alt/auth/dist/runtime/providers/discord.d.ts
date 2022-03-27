import type { ProviderOptions, ProviderPartialOptions } from "../../type";
import type { Oauth2SchemeOptions } from "../schemes";
export interface DiscordProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
export declare function discord(nuxt: any, strategy: ProviderPartialOptions<DiscordProviderOptions>): void;
