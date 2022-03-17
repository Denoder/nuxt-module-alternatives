<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script setup>
const ctx = useNuxtApp()
console.log(ctx.$axios)
</script>
