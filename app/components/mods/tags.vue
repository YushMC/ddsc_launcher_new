<template>
  <section class="w-full flex justify-center items-center my-2 gap-2">
    <UBadge
      v-for="(item, index) in props.generes"
      :key="index"
      color="primary"
      size="xl"
      >{{ item }}</UBadge
    >
    <UBadge :color="status" size="xl">{{
      Object.values(ENUMS_STATUS).find((s) => s.value === props.status)?.label
    }}</UBadge>
    <UBadge color="info" size="xl">{{
      Object.values(ENUMS_DURATION).find((d) => d.value === props.duration)
        ?.label
    }}</UBadge>
    <UBadge v-if="props.character" color="neutral" variant="solid" size="xl">{{
      Object.values(ENUMS_CHARACTER_FOCUS).find(
        (c) => c.value === props.character,
      )?.label
    }}</UBadge>
  </section>
</template>

<script setup lang="ts">
interface props {
  generes: string[];
  status: any;
  duration: any;
  character?: any;
}
const props = defineProps<props>();

const ENUMS_DURATION = {
  veryshort: {
    label: "Muy corto",
    value: "very_short",
  },
  short: {
    label: "Corto",
    value: "short",
  },
  medium: {
    label: "Medio",
    value: "medium",
  },
  long: {
    label: "Largo",
    value: "long",
  },
  veryLong: {
    label: "Muy largo",
    value: "very_long",
  },
  endless: {
    label: "Interminable",
    value: "endless",
  },
  unknown: {
    label: "Desconocido",
    value: "unknown",
  },
} as const;

const ENUMS_STATUS = {
  underDevelopment: {
    label: "En desarrollo",
    value: "under_development",
  },
  demo: {
    label: "Demo",
    value: "beta",
  },
  stable: {
    label: "Terminado",
    value: "stable",
  },
  legacy: {
    label: "Legado",
    value: "legacy",
  },
  abandoned: {
    label: "Abandonado",
    value: "abandoned",
  },
  onIce: {
    label: "En pausa",
    value: "on_ice",
  },
  archived: {
    label: "Archivado",
    value: "archived",
  },
  unknown: {
    label: "Desconocido",
    value: "unknown",
  },
} as const;

const ENUMS_CHARACTER_FOCUS = {
  mc: { label: "MC", value: "mc" },
  sayori: { label: "Sayori", value: "sayori" },
  natsuki: { label: "Natsuki", value: "natsuki" },
  yuri: { label: "Yuri", value: "yuri" },
  monika: { label: "Monika", value: "monika" },
  oc: { label: "OC", value: "oc" },
} as const;

const status = ref<any>("");

watchEffect(() => {
  switch (props.status) {
    case "under_development":
      status.value = "success";
      break;
    case "abandoned":
      status.value = "error";
      break;
    case "stable":
      status.value = "success";
      break;
    case "beta":
      status.value = "warning";
      break;
    default:
      status.value = "neutral";
  }
});
</script>

<style scoped></style>
