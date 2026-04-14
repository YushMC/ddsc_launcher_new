<template>
  <div class="min-h-dvh flex flex-col scrollbar-thin justiify-center">
    <Header />
    <div class="w-full h-full flex items-center justify-center">
      <slot class="w-full h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { setIdUser } = useSO();

const logout = () => {
  setIdUser(null);
  navigateTo("/");
};
const items: any[] = [];
</script>

<style scoped>
#main-panel {
  background: #faf5f7 !important;
}
</style>
