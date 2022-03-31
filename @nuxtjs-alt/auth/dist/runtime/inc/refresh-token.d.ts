import type { RefreshableScheme } from "../../types";
import type { Storage } from "../core";
import { TokenStatus } from "./token-status";
export declare class RefreshToken {
    #private;
    scheme: RefreshableScheme;
    $storage: Storage;
    constructor(scheme: RefreshableScheme, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean;
    sync(): string | boolean;
    reset(): void;
    status(): TokenStatus;
}
