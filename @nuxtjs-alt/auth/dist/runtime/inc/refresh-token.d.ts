import type { RefreshableScheme } from '../../type';
import type { Storage } from '../core';
import { TokenStatus } from './token-status';
export declare class RefreshToken {
    scheme: RefreshableScheme;
    $storage: Storage;
    constructor(scheme: RefreshableScheme, storage: Storage);
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
