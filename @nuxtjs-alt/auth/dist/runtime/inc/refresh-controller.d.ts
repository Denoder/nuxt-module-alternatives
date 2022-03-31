import type { RefreshableScheme, HTTPResponse } from "../../types";
import type { Auth } from "../core";
export declare class RefreshController {
    #private;
    scheme: RefreshableScheme;
    $auth: Auth;
    constructor(scheme: RefreshableScheme);
    handleRefresh(): Promise<HTTPResponse | void>;
}
