import type { TokenableScheme } from '../../types';
import type { Storage } from '../core';
import { TokenStatus } from './token-status';
export declare class Token {
    scheme: TokenableScheme;
    $storage: Storage;
    constructor(scheme: TokenableScheme, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean;
    sync(): string | boolean;
    reset(): void;
    status(): TokenStatus;
    private _getExpiration;
    private _setExpiration;
    private _syncExpiration;
    private _updateExpiration;
    private _setToken;
    private _syncToken;
}
