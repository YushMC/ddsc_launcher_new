<script setup lang="ts">
import { SYSTEMS_NAMES, type SystemName } from "./types/systemData.d";

const { setSystemOS } = useSO();

function getOS(): SystemName | null {
  const ua = navigator.userAgent;

  if (/windows/i.test(ua)) return SYSTEMS_NAMES.WINDOWS;
  if (/macintosh|mac os x/i.test(ua)) return SYSTEMS_NAMES.MACOS;
  if (/linux/i.test(ua)) return SYSTEMS_NAMES.LINUX;

  return null;
}
onBeforeMount(() => {
  try {
    const os = getOS();
    if (!os) {
      console.warn("Unsupported OS detected. Defaulting to Windows.");
    } else {
      setSystemOS(os);
    }
  } catch (error) {
    console.error("Error detecting OS:", error);
  }
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
