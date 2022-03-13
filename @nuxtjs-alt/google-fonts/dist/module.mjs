import { GoogleFontsHelper } from 'google-fonts-helper';
import { defineNuxtModule, createResolver } from '@nuxt/kit';

const name = "@nuxtjs-alt/google-fonts";
const version = "1.0.2";

const CONFIG_KEY = "googleFonts";
const module = defineNuxtModule({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  async setup(moduleOptions, nuxt) {
    const DEFAULTS = {
      families: {},
      display: void 0,
      subsets: [],
      text: void 0,
      prefetch: true,
      preconnect: true,
      preload: true,
      useStylesheet: false,
      download: false,
      base64: false,
      inject: true,
      overwriting: false,
      outputDir: nuxt.options.dir.assets,
      stylePath: "css/fonts.css",
      fontsDir: "fonts",
      fontsPath: "~/assets/fonts"
    };
    const options = {
      ...DEFAULTS,
      ...moduleOptions
    };
    const googleFontsHelper = new GoogleFontsHelper({
      families: options.families,
      display: options.display,
      subsets: options.subsets,
      text: options.text
    });
    const fontsParsed = (nuxt.options.meta.link || []).filter((link) => GoogleFontsHelper.isValidURL(link.href)).map((link) => GoogleFontsHelper.parse(link.href));
    if (fontsParsed.length) {
      googleFontsHelper.merge(...fontsParsed);
    }
    const url = googleFontsHelper.constructURL();
    if (!url) {
      console.warn("No provided fonts.");
      return;
    }
    nuxt.options.meta.link = (nuxt.options.meta.link || []).filter((link) => !GoogleFontsHelper.isValidURL(link.href));
    if (options.download) {
      const outputDir = nuxt.options.alias[options.outputDir] || options.outputDir;
      const resolver = createResolver(outputDir);
      try {
        await GoogleFontsHelper.download(url, {
          base64: options.base64,
          overwriting: options.overwriting,
          outputDir,
          stylePath: options.stylePath,
          fontsDir: options.fontsDir,
          fontsPath: options.fontsPath
        });
        if (options.inject) {
          nuxt.options.css.push(resolver.resolve(options.stylePath));
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }
    if (options.prefetch) {
      nuxt.options.meta.link.push({
        hid: "gf-prefetch",
        rel: "dns-prefetch",
        href: "https://fonts.gstatic.com/"
      });
    }
    if (options.preconnect) {
      nuxt.options.meta.link.push({
        hid: "gf-preconnect",
        rel: "preconnect",
        href: "https://fonts.gstatic.com/",
        crossorigin: ""
      });
    }
    if (options.preload) {
      nuxt.options.meta.link.push({
        hid: "gf-preload",
        rel: "preload",
        as: "style",
        href: url
      });
    }
    if (options.useStylesheet) {
      nuxt.options.meta.link.push({
        hid: "gf-style",
        rel: "stylesheet",
        href: url
      });
      return;
    }
    nuxt.options.meta.script = nuxt.options.meta.script || [];
    nuxt.options.meta.script.push({
      hid: "gf-script",
      innerHTML: `(function(){var l=document.createElement('link');l.rel="stylesheet";l.href="${url}";document.querySelector("head").appendChild(l);})();`
    });
    nuxt.options.meta.noscript = nuxt.options.meta.noscript || [];
    nuxt.options.meta.noscript.push({
      hid: "gf-noscript",
      innerHTML: `<link rel="stylesheet" href="${url}">`
    });
    nuxt.options.meta.__dangerouslyDisableSanitizersByTagID = nuxt.options.meta.__dangerouslyDisableSanitizersByTagID || {};
    nuxt.options.meta.__dangerouslyDisableSanitizersByTagID["gf-script"] = ["innerHTML"];
    nuxt.options.meta.__dangerouslyDisableSanitizersByTagID["gf-noscript"] = ["innerHTML"];
  }
});

export { module as default };
