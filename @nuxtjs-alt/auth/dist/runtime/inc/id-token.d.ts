import type { IdTokenableScheme } from "../../types";
import type { Storage } from "../core";
import { TokenStatus } from "./token-status";
export declare class IdToken {
    #private;
    scheme: IdTokenableScheme;
    $storage: Storage;
    constructor(scheme: IdTokenableScheme, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean;
    sync(): string | boolean;
    reset(): void;
    status(): TokenStatus;
    userInfo(): unknown;
}
