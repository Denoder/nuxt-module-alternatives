import { defineNuxtPlugin } from '#imports'

// Nuxt Options
const proxies = {}
const options = JSON.parse('<%= JSON.stringify(options) %>')

function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]'
}

function doesProxyContextMatchUrl(context, url) {
    return (
        (context.startsWith('^') && new RegExp(context).test(url)) || url.startsWith(context)
    )
}

export default defineNuxtPlugin(nuxtApp => {
    Object.keys(options.proxies).forEach((context) => {
        let opts = options.proxies[context]
    
        if (typeof opts === 'string') {
            opts = { target: opts }
        }
    
        if (isObject(opts)) {
            opts = { ...opts }
        }
    
        proxies[context] = [{ ...opts }]
    })

    if (process.client && options.fetch) {
        $fetch.create({
            async onRequest({ request, options }) {
                for (const context in proxies) {
                    const [opts] = proxies[context]
                    if (doesProxyContextMatchUrl(context, request)) {
                        options.baseURL = opts.target
                    }
                }
            }
        })
    }
})