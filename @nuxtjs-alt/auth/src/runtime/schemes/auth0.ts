import { withQuery } from 'ufo';
import { Oauth2Scheme } from '../schemes/oauth2';

export class Auth0Scheme extends Oauth2Scheme {
    logout(): void {
        this.$auth.reset();

        const opts = {
            client_id: this.options.clientId as string,
            returnTo: this.logoutRedirectURI,
        };

        const url = withQuery(this.options.endpoints.logout as string, opts)
        window.location.replace(url);
    }
}
