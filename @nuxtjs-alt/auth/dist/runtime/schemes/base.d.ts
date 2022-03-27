import type { SchemeOptions } from "../../type";
import type { Auth } from "../core";
export declare class BaseScheme<OptionsT extends SchemeOptions> {
    $auth: Auth;
    options: OptionsT;
    constructor($auth: Auth, ...options: OptionsT[]);
    get name(): string;
}
