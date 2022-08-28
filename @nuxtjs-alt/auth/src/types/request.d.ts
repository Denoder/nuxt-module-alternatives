import { FetchConfig } from '@refactorjs/ofetch'
// TODO: Avoid using axios as base
export type HTTPRequest = FetchConfig & {
    
};
export type HTTPResponse = Promise<any>;
