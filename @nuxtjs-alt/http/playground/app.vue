<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script setup>
  const { $http } = useNuxtApp()
  console.log($http)
</script>
