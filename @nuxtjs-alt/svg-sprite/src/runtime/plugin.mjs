import svgSprite from '~svg-sprite-runtime'
import { defineNuxtPlugin } from '#app'

const SPRITES = {
    <%= options.sprites.map(key => `"${key}": () => import('${options.output}/${key}.svg')`).join(',') %>
}

export default defineNuxtPlugin(ctx => {
    ctx.provide('svgSprite', svgSprite({
        importSprite: key => SPRITES[key] ? SPRITES[key]() : Promise.resolve(""),
        defaultSprite: '<%= options.defaultSprite %>',
        spriteClassPrefix: '<%= options.spriteClassPrefix %>',
        spriteClass: '<%= options.elementClass %>',
    }))
})

