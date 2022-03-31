import type { SchemeOptions } from "../../types";
import type { Auth } from "../core";
export declare class BaseScheme<OptionsT extends SchemeOptions> {
    $auth: Auth;
    options: OptionsT;
    constructor($auth: Auth, ...options: OptionsT[]);
    get name(): string;
}
