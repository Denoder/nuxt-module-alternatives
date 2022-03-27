import type { TokenableScheme } from "../../type";
import type { Storage } from "../core";
import { TokenStatus } from "./token-status";
export declare class Token {
    #private;
    scheme: TokenableScheme;
    $storage: Storage;
    constructor(scheme: TokenableScheme, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean;
    sync(): string | boolean;
    reset(): void;
    status(): TokenStatus;
}
