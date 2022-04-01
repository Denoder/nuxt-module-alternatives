import { createProxyMiddleware } from 'http-proxy-middleware';
import { createResolver, addServerMiddleware, defineNuxtModule } from '@nuxt/kit';
import fs from 'fs-extra';

const name = "@nuxtjs-alt/proxy";
const version = "1.0.9";

function getProxyEntries(proxyOptions, defaults) {
  const applyDefaults = (opts) => ({ ...defaults, ...opts });
  const normalizeTarget = (input) => typeof input === "object" ? input : { target: input };
  const proxyEntries = [];
  if (!proxyOptions) {
    return proxyEntries;
  }
  if (!Array.isArray(proxyOptions)) {
    for (const key in proxyOptions) {
      proxyEntries.push({
        context: key,
        options: applyDefaults(normalizeTarget(proxyOptions[key]))
      });
    }
    return proxyEntries;
  }
  for (const input of proxyOptions) {
    if (Array.isArray(input)) {
      proxyEntries.push({
        context: input[0],
        options: applyDefaults(normalizeTarget(input[1]))
      });
    } else {
      proxyEntries.push({
        context: input,
        options: applyDefaults()
      });
    }
  }
  return proxyEntries;
}
function createMiddlewareFile(opt) {
  try {
    const resolver = createResolver(opt.nuxt.options.srcDir);
    const proxyDirectory = resolver.resolve("server/proxy");
    const filePath = proxyDirectory + `/proxy-${opt.index}.ts`;
    fs.outputFileSync(filePath, proxyMiddlewareContent(opt.proxyEntry));
    addServerMiddleware({ handle: filePath });
  } catch (err) {
    console.error(err);
  }
}
function proxyMiddlewareContent(entry) {
  return `
import type { IncomingMessage, ServerResponse } from 'http'
import { createProxyMiddleware } from 'http-proxy-middleware'

const middleware = createProxyMiddleware('${entry.context}', ${JSON.stringify(entry.options)})

export default async (req: IncomingMessage, res: ServerResponse) => {

    await new Promise<void>((resolve, reject) => {
        const next = (err?: unknown) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }

        /* @ts-ignore */
        middleware(req, res, next)
    })
}`;
}

const CONFIG_KEY = "proxy";
const module = defineNuxtModule({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  setup(options, nuxt) {
    const defaults = {
      changeOrigin: true,
      ws: true
    };
    const proxyEntries = getProxyEntries(options, defaults);
    const resolver = createResolver(nuxt.options.srcDir);
    const proxyDirectory = resolver.resolve("server/proxy");
    fs.emptyDirSync(proxyDirectory);
    Object.values(proxyEntries).forEach((proxyEntry, index) => {
      if (process.env.NODE_ENV !== "production") {
        addServerMiddleware({ handle: createProxyMiddleware(proxyEntry.context, proxyEntry.options) });
      } else {
        createMiddlewareFile({ proxyEntry, index, nuxt });
      }
    });
  }
});

export { module as default };
