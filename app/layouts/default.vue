<template>
  <div class="flex flex-col w-full fit-content max-h-dvh overflow-hidden">
    <UContainer
      class="h-[90dvh] py-5 flex items-center justify-center w-full px-0"
    >
      <div class="w-fit h-fit overflow-y-auto">
        <slot />
      </div>
    </UContainer>
    <UCard class="w-full m-0 p-0 h-[10dvh]" variant="outline">
      <div class="h-full flex items-center justify-between px-5 py-0 m-0">
        <div class="flex items-start gap-5 jusrtify-start">
          <ULink
            raw
            to="/home"
            class="px-2 py-1 border-b-2 border-b-transparent"
            active-class="bg-primary/5 border-b-white"
          >
            Inicio
          </ULink>
          <ULink
            raw
            to="/mods"
            class="px-2 py-1 border-b-2 border-b-transparent"
            active-class="bg-primary/5 border-b-white/10"
          >
            Mods
          </ULink>
          <ULink
            raw
            to="/home"
            class="px-2 py-1 border-b-2 border-b-transparent"
            active-class="bg-primary/5 border-b-white/10"
          >
            Ajustes
          </ULink>
        </div>
        <div class="flex items-center gap-2 justify-end items-center">
          <LayoutCredits />
          <LayoutClock />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
