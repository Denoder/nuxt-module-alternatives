import type { RefreshableScheme, HTTPResponse } from '../../type';
import type { Auth } from '../core';
export declare class RefreshController {
    scheme: RefreshableScheme;
    $auth: Auth;
    private _refreshPromise;
    constructor(scheme: RefreshableScheme);
    handleRefresh(): Promise<HTTPResponse | void>;
    private _doRefresh;
}
