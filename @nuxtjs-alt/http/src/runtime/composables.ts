import type { FetchConfig } from '@refactorjs/ofetch'
import type { TypedInternalResponse, NitroFetchRequest } from 'nitropack'
import type { AsyncDataOptions, _Transform, KeyOfRes, AsyncData, PickFrom } from '#app'
import { computed, isRef, Ref } from 'vue'
import { useAsyncData } from '#imports'
import { hash } from 'ohash'

export type FetchResult<ReqT extends NitroFetchRequest> = TypedInternalResponse<ReqT, unknown>

export interface UseFetchOptions<
    DataT,
    Transform extends _Transform<DataT, any> = _Transform<DataT, DataT>,
    PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
    > extends AsyncDataOptions<DataT, Transform, PickKeys>, FetchConfig {
    key?: string
}

export function useFetch<
    ResT = void,
    ErrorT = Error,
    ReqT extends NitroFetchRequest = NitroFetchRequest,
    _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
    Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
    PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
    request: Ref<ReqT> | ReqT | (() => ReqT),
    opts: UseFetchOptions<_ResT, Transform, PickKeys>
): AsyncData<PickFrom<ReturnType<Transform>, PickKeys>, ErrorT | null | true>
export function useFetch<
    ResT = void,
    ErrorT = Error,
    ReqT extends NitroFetchRequest = NitroFetchRequest,
    _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
    Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
    PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
    request: Ref<ReqT> | ReqT | (() => ReqT),
    opts: UseFetchOptions<_ResT, Transform, PickKeys> = {},
) {
    if (process.dev && !opts.key && Object.values(opts).some(v => typeof v === 'function' || v instanceof Blob)) {
        console.warn('[nuxt] [useFetch] You should provide a key when passing options that are not serializable to JSON:', opts)
    }

    if (!request) {
        throw new Error('[nuxt] [useFetch] request is missing.')
    }

    const key = '$f_' + (opts.key || hash([request, { ...opts, transform: null }]))

    const _request = computed(() => {
        let r = request
        if (typeof r === 'function') {
            r = r()
        }
        return (isRef(r) ? r.value : r)
    })

    const { server, lazy, default: defaultFn, transform, pick, watch, initialCache, ...fetchOptions } = opts

    const _fetchOptions = {
        ...fetchOptions,
        cache: typeof opts.cache === 'boolean' ? undefined : opts.cache
    }

    const _asyncDataOptions: AsyncDataOptions<_ResT, Transform, PickKeys> = {
        server,
        lazy,
        default: defaultFn,
        transform,
        pick,
        initialCache,
        watch: [
            _request,
            ...(watch || [])
        ]
    }

    const asyncData = useAsyncData<_ResT, ErrorT, Transform, PickKeys>(key, () => {
        const method = opts && opts.method && ['get', 'head', 'delete', 'post', 'put', 'patch'].includes(opts.method.toLowerCase()) ? opts.method.toLowerCase() : 'get'
        return globalThis.$fetch['$' + method](_request.value, _fetchOptions) as Promise<_ResT>
    }, _asyncDataOptions)

    return asyncData
}

export function useLazyFetch<
    ResT = void,
    ErrorT = Error,
    ReqT extends NitroFetchRequest = NitroFetchRequest,
    _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
    Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
    PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
    request: Ref<ReqT> | ReqT | (() => ReqT),
    opts: Omit<UseFetchOptions<_ResT, Transform, PickKeys>, 'lazy'>
): AsyncData<PickFrom<ReturnType<Transform>, PickKeys>, ErrorT | null | true>
export function useLazyFetch<
    ResT = void,
    ErrorT = Error,
    ReqT extends NitroFetchRequest = NitroFetchRequest,
    _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
    Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
    PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
    request: Ref<ReqT> | ReqT | (() => ReqT),
    opts: Omit<UseFetchOptions<_ResT, Transform, PickKeys>, 'lazy'> = {},
) {
    return useFetch<ResT, ErrorT, ReqT, _ResT, Transform, PickKeys>(request, {
        ...opts,
        lazy: true
    })
}

export function useHttp<
    ResT = void,
    ErrorT = Error,
    ReqT extends NitroFetchRequest = NitroFetchRequest,
    _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
    Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
    PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
    request: Ref<ReqT> | ReqT | (() => ReqT),
    opts: UseFetchOptions<_ResT, Transform, PickKeys>
): AsyncData<PickFrom<ReturnType<Transform>, PickKeys>, ErrorT | null | true>
export function useHttp<
    ResT = void,
    ErrorT = Error,
    ReqT extends NitroFetchRequest = NitroFetchRequest,
    _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
    Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
    PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
    request: Ref<ReqT> | ReqT | (() => ReqT),
    opts: UseFetchOptions<_ResT, Transform, PickKeys> = {}
) {
    if (process.dev && !opts.key && Object.values(opts).some(v => typeof v === 'function' || v instanceof Blob)) {
        console.warn('[nuxt] [useFetch] You should provide a key when passing options that are not serializable to JSON:', opts)
    }

    if (!request) {
        throw new Error('[nuxt] [useHttp] request is missing.')
    }

    const key = '$h_' + (opts.key || hash([request, { ...opts, transform: null }]))

    const _request = computed(() => {
        let r = request
        if (typeof r === 'function') {
            r = r()
        }
        return (isRef(r) ? r.value : r)
    })


    const { server, lazy, default: defaultFn, transform, pick, watch, initialCache, ...fetchOptions } = opts

    const _fetchOptions = {
        ...fetchOptions,
        cache: typeof opts.cache === 'boolean' ? undefined : opts.cache
    }

    const _asyncDataOptions: AsyncDataOptions<_ResT, Transform, PickKeys> = {
        server,
        lazy,
        default: defaultFn,
        transform,
        pick,
        initialCache,
        watch: [
            _request,
            ...(watch || [])
        ]
    }

    const asyncData = useAsyncData<_ResT, ErrorT, Transform, PickKeys>(key, () => {
        const method = opts && opts.method && ['get', 'head', 'delete', 'post', 'put', 'patch'].includes(opts.method.toLowerCase()) ? opts.method.toLowerCase() : 'get'
        return globalThis.$http['$' + method](_request.value, _fetchOptions) as Promise<_ResT>
    }, _asyncDataOptions)

    return asyncData
}

export function useLazyHttp<
    ResT = void,
    ErrorT = Error,
    ReqT extends NitroFetchRequest = NitroFetchRequest,
    _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
    Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
    PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
    request: Ref<ReqT> | ReqT | (() => ReqT),
    opts: Omit<UseFetchOptions<_ResT, Transform, PickKeys>, 'lazy'>
): AsyncData<PickFrom<ReturnType<Transform>, PickKeys>, ErrorT | null | true>
export function useLazyHttp<
    ResT = void,
    ErrorT = Error,
    ReqT extends NitroFetchRequest = NitroFetchRequest,
    _ResT = ResT extends void ? FetchResult<ReqT> : ResT,
    Transform extends (res: _ResT) => any = (res: _ResT) => _ResT,
    PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
    request: Ref<ReqT> | ReqT | (() => ReqT),
    opts: Omit<UseFetchOptions<_ResT, Transform, PickKeys>, 'lazy'> = {},
) {

    return useHttp<ResT, ErrorT, ReqT, _ResT, Transform, PickKeys>(request, {
        ...opts,
        lazy: true
    })
}