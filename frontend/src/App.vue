<script setup>
import ToastContainer from "./components/ui/ToastContainer.vue";
</script>

<template>
  <div class="page-transition h-full">
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" :key="$route.fullPath" />
      </transition>
    </router-view>
  </div>
  <ToastContainer />
</template>
