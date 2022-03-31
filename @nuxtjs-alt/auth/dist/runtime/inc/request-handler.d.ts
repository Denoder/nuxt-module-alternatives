import type { TokenableScheme, RefreshableScheme } from "../../types";
import { NuxtAxiosInstance } from "@nuxtjs-alt/axios";
export declare class RequestHandler {
    #private;
    scheme: TokenableScheme | RefreshableScheme;
    axios: NuxtAxiosInstance;
    interceptor: number;
    constructor(scheme: TokenableScheme | RefreshableScheme, axios: NuxtAxiosInstance);
    setHeader(token: string): void;
    clearHeader(): void;
    initializeRequestInterceptor(refreshEndpoint?: string): void;
    reset(): void;
}
