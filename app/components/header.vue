<template>
  <header
    class="flex items-center justify-between w-full p-4 border-rounded-lg sticky top-0 z-50 bg-[#a4287f]"
  >
    <div class="flex items-center justify-between gap-2 w-full">
      <figure
        style="cursor: pointer"
        @click="navigateTo('/')"
        class="flex items-center justify-center gap-2"
      >
        <NuxtImg
          src="https://www.dokidokispanish.club/images/Logo_DDSC.png"
          alt="Logo DDSC"
          width="50"
          loading="lazy"
          decoding="async"
        />
        <figcaption>
          <h1 class="text-white font-bold text-2xl">
            Doki Doki Spanish Club Launcher
          </h1>
        </figcaption>
      </figure>

      <div class="flex justify-center items-center" style="align-items: center">
        <UTabs
          v-model="active"
          :content="false"
          :items="items"
          class="w-full"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

interface CommandItem {
  label: string;
  icon: string;
  to: string;
  onClick: () => void;
}
const active = ref("0");

watch(active, (newValue) => {
  if (newValue === "0") {
    navigateTo("/");
  } else if (newValue === "1") {
    navigateTo("/mods");
  }
});

const items: TabsItem[] = [
  {
    label: "Biblioteca",
    icon: "i-lucide-library",
  },
  {
    label: "Mods",
    icon: "i-lucide-book",
  },
];
const open = ref(false);

defineShortcuts({
  meta_1: () => {
    active.value = "0";
    navigateTo("/");
  },
  meta_2: () => {
    active.value = "1";
    navigateTo("/mods");
  },
});
const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);
</script>

<style scoped>
a {
  color: white !important;
}
</style>
