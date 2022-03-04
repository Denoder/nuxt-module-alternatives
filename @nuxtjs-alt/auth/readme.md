**Information**

This module is meant as an alternative to @nuxtjs/auth, except this is for nuxt3 only with no backwards compatibility support.

This will only work with pinia, I had originally had it work with vuex, but since that is in maintenece mode, I decided to switch to pinia. 
The middleware is a little buggy I believe, but please do tell me if you find any bugs.

Again if you find any bugs please do tell me, I'm still working on this.

**Cookie-based auth**

If you have any specific changes that need to be made to accomodate cookie based-auth please tell me, at this moment the way I configured it is that it pretty much does the same thing as the official auth module cookie, but in cases where the server autmaitcally attaches the server cookie to all requests it will function conrrently (in this case setting a cookie on all requests via laravel).

the config would look like this

```ts
    auth: {
        redirect: {
            home: '/'
        },
        strategies: {
            localStorage: false,
            cookie: {
                cookie: {
                    server: true,
                    name: 'token',
                },
                endpoints: {
                    login: { url: '/api/user/login', method: 'post' },
                    user: { url: '/api/user/me', method: 'get' }
                },
                user: {
                    property: {
                        client: false,
                        server: 'user'
                    },
                    autoFetch: true
                }
            },
        }
    }
```

notice the `cookie.server` property, this indicates that the cookie we will be looking for will be set upon login otherwise we will be looking at a client/browser cookie.
the cookie scheme has been moved to its own scheme so the user property takes place within the cookie strategy and doesnt extend the token scheme from the local scheme. There has also been 2 user properties one for the client/browser and one for the server.

**Middleware**

For some reason the context of nuxt is not available when the middleware is set to global, so with that in mind, setting it to global has been disabled. As an alternative you may try to create your own middleware and disable this one by setting `enableMiddleware: false`

**Depenencies Needed:**
- @nuxtjs-alt/axios
- @nuxtjs-alt/pinia or @pinia/nuxt
- body-parser
- cookie
- defu
- hasha
- jwt-decode
- requrl
- @nuxt/kit
