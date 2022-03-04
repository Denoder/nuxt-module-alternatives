export declare enum TokenStatusEnum {
    UNKNOWN = "UNKNOWN",
    VALID = "VALID",
    EXPIRED = "EXPIRED"
}
export declare class TokenStatus {
    private readonly _status;
    constructor(token: string | boolean, tokenExpiresAt: number | false);
    unknown(): boolean;
    valid(): boolean;
    expired(): boolean;
    private _calculate;
}
