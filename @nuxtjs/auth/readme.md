**Depenencies Needed:**
- @nuxtjs/axios
- body-parser
- cookie
- defu
- hasha
- jwt-decode
- requrl
- @nuxt/kit

**Information**

This will only work with pinia, I had originally had it work with vuex, but since that is in maintenece mode, I decided to switch to pinia. 
The middleware is a little buggy I believe, but please do tell me if you find any bugs. I have also disabled the auto redirect upon logging in, for now you need to manually
redirect when you successfuly log in until I fix it.

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

notics the `cookie.server` property, this indicates that the cookie we will be looking for will be set uplon login otherwise we will be looking ata client/browser cookie.
the cookie scheme has been moved to its own scheme so the user property takes place within the cookie strategy and doest extend the token scheme from the local scheme. There has also been 2 user properties one for the client/browser and one for the server.

**Layouts**

Please do note, that currently the way nuxt 3 works, that if you use the auth module and you are utitlizing multiple layouts, that it will not work and any redirection will fail. You will need to be using one layout, but if you find some way around this, please do tell me. This  seems to be an issue with or without this module, ad any redirection to a new layout will cause and error. 

**Middleware**

Another thing is that for some reason the context of nuxt is not available when i set the middleware to global, so with that in mind, srtting it to global has been disabled. I have tried to figure out ohow to use it when it's in global but nothing works, the auth instance isnt avaialble until after. Even when i try to hook onto when a page is mounted that does not work. 
