import { FetchConfig } from '@refactorjs/ofetch'

export type HTTPRequest = FetchConfig & {
    
};
export type HTTPResponse = Promise<any>;
