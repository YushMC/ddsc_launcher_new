<template>
  <div class="flex flex-col items-end gap-0">
    <div class="text-sm text-muted-foreground">{{ currentTime }}</div>
    <div class="text-xs text-muted-foreground">
      {{ new Date().toLocaleDateString() }}
    </div>
  </div>
</template>

<script setup lang="ts">
const clock = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const currentTime = ref(clock());

const calculateTime = () => {
  currentTime.value = clock();
};

setInterval(calculateTime, 1000);
</script>

<style scoped></style>
