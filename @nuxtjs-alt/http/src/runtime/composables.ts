import type { FetchRequest } from 'ohmyfetch'
import { useAsyncData } from '#imports'
import { hash } from 'ohash'
import { computed, isRef } from 'vue'

export function useFetch(request: any, opts = {}) {
    const key = '$h_' + (opts.key || hash([request, opts]))
    const _request = computed<FetchRequest>(() => {
        let r = request
        if (typeof r === 'function') {
            r = r()
        }
        return isRef(r) ? r.value : r
    })

    const _fetchOptions = {
        ...opts,
        cache: typeof opts.cache === 'boolean' ? undefined : opts.cache
    }

    const _asyncDataOptions = {
        ...opts,
        watch: [
            _request,
            ...(opts.watch || [])
        ]
    }

    const asyncData = useAsyncData(key, () => {
        const method = ['get', 'head', 'delete', 'post', 'put', 'patch'].includes(opts.method) ? opts.method : 'get'
        return $fetch[method](_request.value, _fetchOptions)
    }, _asyncDataOptions)

    return asyncData
}

export function useLazyFetch(request: any, opts = {}) {
    return useFetch(request, { ...opts, lazy: true })
}

export function useHttp(request: any, opts = {}) {
    const key = '$h_' + (opts.key || hash([request, opts]))
    const _request = computed<FetchRequest>(() => {
        let r = request
        if (typeof r === 'function') {
            r = r()
        }
        return isRef(r) ? r.value : r
    })

    const _fetchOptions = {
        ...opts,
        cache: typeof opts.cache === 'boolean' ? undefined : opts.cache
    }

    const _asyncDataOptions = {
        ...opts,
        watch: [
            _request,
            ...(opts.watch || [])
        ]
    }

    const asyncData = useAsyncData(key, () => {
        const method = ['get', 'head', 'delete', 'post', 'put', 'patch'].includes(opts.method) ? opts.method : 'get'
        return $http[method](_request.value, _fetchOptions)
    }, _asyncDataOptions)

    return asyncData
}

export function useLazyHttp(request: any, opts = {}) {
    return useHttp(request, { ...opts, lazy: true })
}