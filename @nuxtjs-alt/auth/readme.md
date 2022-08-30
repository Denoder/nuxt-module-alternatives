**Information**

This module is meant as an alternative to @nuxtjs/auth, except this is for nuxt3 only with no backwards compatibility support. This will only work with pinia, I had originally had it work with vuex, but since that is in maintenece mode, I decided to switch to pinia. If you find any bugs please do tell me, I'm still working on this.

**Typescript**

Please note, any issues regarding typescript is not a priorty for me. If you're having issues with it it'll be noted but not a priority, I normally have typescript disabled to focus on the functionality of the module.

**Refactored (Version 2.0.0+)**

The module now requires '@nuxtjs-alt/http' to function in version 2.0.0 and up, that module extends ohmyfetch. Please note that if you were using `data` to post data, you now need to use `body` since this is what `ohmyfetch` uses.
Please tell me if you encounter any issues with these changes.

**Cookie-based auth**

If you have any specific changes that need to be made to accomodate cookie based-auth please tell me, at this moment the way I configured it is that it pretty much does the same thing as the official auth module cookie, but in cases where the server autmaitcally attaches the server cookie to all requests it will function conrrently (in this case setting a cookie on all requests via laravel).

the config would look like this

```ts
    auth: {
        strategies: {
            localStorage: false,
            cookie: {
                cookie: {
                    server: true,
                    name: 'token',
                },
                endpoints: {
                    csrf: false,
                    login: { url: '/api/user/login', method: 'post' },
                    user: { url: '/api/user/me', method: 'get' }
                },
                user: {
                    property: {
                        client: false,
                        server: false
                    },
                    autoFetch: true
                }
            },
        }
    }
```

notice the `cookie.server` property, this indicates that the cookie we will be looking for will be set upon login otherwise we will be looking at a client/browser cookie.
the cookie scheme has been moved to its own scheme so the user property takes place within the cookie strategy and doesnt extend the token scheme from the local scheme. There has also been 2 user properties one for the client/browser and one for the server.

**Laravel Sanctum**

Laravel Sanctum wokrs a tiny bit differently, It inherits the same config as the Cookie scheme (see above) here's what the config would look like:

```ts
    auth: {
        strategies: {
            laravelSanctum: {
                provider: 'laravel/sanctum',
                cookie: {
                    server: true,
                    name: 'XSRF-TOKEN',
                },
                endpoints: {
                    csrf: { url: '/sanctum/csrf-cookie' },
                    login: { url: '/login' },
                    logout: { url: '/logout' },
                    user: { url: '/api/user' }
                },
                user: {
                    property: {
                        client: false,
                        server: false
                    },
                    autoFetch: true
                }
            },
        }
    }
```

**Oauth2**

Oauth2 now has client window authentication thanks to this pull request: https://github.com/nuxt-community/auth-module/pull/1746
properties have been changed to:
- `clientWindow`: `boolean`
- `clientWindowWidth`: `number`
- `clientWindowHeight`: `number`
