<script setup>
// const route = useRoute();
const nuxt = useNuxtApp();

// console.log(route.params);
console.log(nuxt);
</script>

<template>
    <div>
        event id: {{ $route.params.id }}
    </div>
</template>