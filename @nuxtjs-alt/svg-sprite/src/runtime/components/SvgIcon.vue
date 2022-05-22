<template>
    <svg :view-box="viewBox" :class="svgClass">
        <title v-if="title">{{ title }}</title>
        <desc v-if="desc">{{ desc }}</desc>
        <use v-if="icon.url" :href="icon.url" />
    </svg>
</template>

<script setup>
const { $svgSprite } = useNuxtApp()
const icon = await $svgSprite.getIcon(props.name)

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: null
    },
    desc: {
        type: String,
        default: null
    },
    viewBox: {
        type: String,
        default: null,
        validator(value) {
            return value.split(' ').every((v) => {
                return !isNaN(parseInt(v))
            })
        }
    }
})

const svgClass = computed(() => `${$svgSprite.spriteClass} ${$svgSprite.spriteClassPrefix}${icon.sprite}`)

</script>
