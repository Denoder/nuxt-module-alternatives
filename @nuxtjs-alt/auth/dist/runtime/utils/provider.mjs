import fs from "fs-extra";
import { defu } from "defu";
import { createResolver } from "@nuxt/kit";
export function assignDefaults(strategy, defaults) {
  Object.assign(strategy, defu(strategy, defaults));
}
export function addAuthorize(nuxt, strategy, useForms = false) {
  const clientSecret = strategy.clientSecret;
  const clientID = strategy.clientId;
  const tokenEndpoint = strategy.endpoints.token;
  const audience = strategy.audience;
  delete strategy.clientSecret;
  const endpoint = `/_auth/oauth/${strategy.name}/authorize`;
  strategy.endpoints.token = endpoint;
  strategy.responseType = "code";
  const resolver = createResolver(nuxt.options.srcDir);
  const proxyDirectory = resolver.resolve("server/middleware/@auth");
  const filePath = proxyDirectory + `/addAuthorize.ts`;
  fs.outputFileSync(filePath, authorizeMiddlewareFile({
    endpoint,
    strategy,
    useForms,
    clientSecret,
    clientID,
    tokenEndpoint,
    audience
  }));
}
export function initializePasswordGrantFlow(nuxt, strategy) {
  const clientSecret = strategy.clientSecret;
  const clientId = strategy.clientId;
  const tokenEndpoint = strategy.endpoints.token;
  delete strategy.clientSecret;
  const endpoint = `/_auth/${strategy.name}/token`;
  strategy.endpoints.login.url = endpoint;
  strategy.endpoints.refresh.url = endpoint;
  const resolver = createResolver(nuxt.options.srcDir);
  const proxyDirectory = resolver.resolve("server/middleware/@auth");
  const filePath = proxyDirectory + `/passwordGrant.ts`;
  fs.outputFileSync(filePath, passwordGrantMiddlewareFile({
    endpoint,
    strategy,
    clientSecret,
    clientId,
    tokenEndpoint
  }));
}
export function assignAbsoluteEndpoints(strategy) {
  const { url, endpoints } = strategy;
  if (endpoints) {
    for (const key of Object.keys(endpoints)) {
      const endpoint = endpoints[key];
      if (endpoint) {
        if (typeof endpoint === "object") {
          if (!endpoint.url || endpoint.url.startsWith(url)) {
            continue;
          }
          endpoints[key].url = url + endpoint.url;
        } else {
          if (endpoint.startsWith(url)) {
            continue;
          }
          endpoints[key] = url + endpoint;
        }
      }
    }
  }
}
export function authorizeMiddlewareFile(opt) {
  return `
import axios from 'axios'
import qs from 'querystring'
import bodyParser from 'body-parser'
import { defineEventHandler } from 'h3'

// Form data parser
const formMiddleware = bodyParser.urlencoded({ extended: true })

export default defineEventHandler(async (event) => {
    await new Promise<void>((resolve, reject) => {
        const next = (err?: unknown) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }

        if (!event.req.url.includes(${opt.endpoint})) {
            return next()
        }
    
        if (event.req.method !== 'POST') {
            return next()
        }
    
        formMiddleware(event.req, event.res, () => {
            const {
                code,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri = ${opt.strategy.redirectUri},
                response_type: responseType = ${opt.strategy.responseType},
                grant_type: grantType = ${opt.strategy.grantType},
                refresh_token: refreshToken
            } = req.body
    
            // Grant type is authorization code, but code is not available
            if (grantType === 'authorization_code' && !code) {
                return next()
            }
    
            // Grant type is refresh token, but refresh token is not available
            if (grantType === 'refresh_token' && !refreshToken) {
                return next()
            }
    
            let data: qs.ParsedUrlQueryInput | string = {
                client_id: ${opt.clientID},
                client_secret: ${opt.clientSecret},
                refresh_token: refreshToken,
                grant_type: grantType,
                response_type: responseType,
                redirect_uri: redirectUri,
                ${opt.audience},
                code_verifier: codeVerifier,
                code
            }
    
            const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
    
            if (strategy.clientSecretTransport === 'authorization_header') {
                // @ts-ignore
                headers.Authorization = 'Basic ' + Buffer.from(${opt.clientID} + ':' + ${opt.clientSecret}).toString('base64')
                // client_secret is transported in auth header
                delete data.client_secret
            }
    
            if (useForms) {
                data = qs.stringify(data)
                headers['Content-Type'] = 'application/x-www-form-urlencoded'
            }
    
            axios
                .request({
                    method: 'post',
                    url: ${opt.tokenEndpoint},
                    data,
                    headers
                })
                .then((response) => {
                    event.res.end(JSON.stringify(response.data))
                })
                .catch((error) => {
                    event.res.statusCode = error.response.status
                    event.res.end(JSON.stringify(error.response.data))
                })
        })
    })
})
`;
}
export function passwordGrantMiddlewareFile(opt) {
  return `
import axios from 'axios'
import requrl from 'requrl'
import bodyParser from 'body-parser'
import { defineEventHandler } from 'h3'

// Form data parser
const formMiddleware = bodyParser.json()

export default defineEventHandler(async (event) => {
    await new Promise<void>((resolve, reject) => {
        const next = (err?: unknown) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }

        if (!event.req.url.includes(${opt.endpoint})) {
            return next()
        }
    
        if (event.req.method !== 'POST') {
            return next()
        }
    
        formMiddleware(event.req, event.res, () => {
            const data = event.req.body
    
            // If \`grant_type\` is not defined, set default value
            if (!data.grant_type) {
                data.grant_type = ${opt.strategy.grantType}
            }
    
            // If \`client_id\` is not defined, set default value
            if (!data.client_id) {
                data.grant_type = ${opt.clientId}
            }
    
            // Grant type is password, but username or password is not available
            if (
                data.grant_type === 'password' &&
                (!data.username || !data.password)
            ) {
                return next(new Error('Invalid username or password'))
            }
    
            // Grant type is refresh token, but refresh token is not available
            if (data.grant_type === 'refresh_token' && !data.refresh_token) {
                return next(new Error('Refresh token not provided'))
            }
    
            axios
                .request({
                    method: 'post',
                    url: ${opt.tokenEndpoint},
                    baseURL: requrl(event.req),
                    data: {
                        client_id: ${opt.clientId},
                        client_secret: ${opt.clientSecret},
                        ...data
                    },
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .then((response) => {
                    event.res.end(JSON.stringify(response.data))
                })
                .catch((error) => {
                    event.res.statusCode = error.response.status
                    event.res.end(JSON.stringify(error.response.data))
                })
        })
    })
})
`;
}
