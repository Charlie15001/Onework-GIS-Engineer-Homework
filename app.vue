<script setup lang="ts">
const { coord } = useFoo();
coord();
</script>

<template>
  <div>
    <NuxtLayout>
      <header>
        <ul>
          <li>
            <!-- Create a link that pushes to a route -->
            <NuxtLink to="/">Home</NuxtLink>
            <NuxtLink to="/events">Events</NuxtLink>
          </li>
        </ul>
      </header>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>
