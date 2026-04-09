<template>
  <UModal title="Información del Launcher">
    <UTooltip text="Información del Launcher" :delay-duration="0">
      <UButton icon="i-lucide-info" />
    </UTooltip>
    <template #body>
      <UContainer class="flex flex-col gap-2">
        <div class="text-sm text-muted-foreground">DDSC Launcher v1.0.0</div>
        <div class="text-sm text-muted-foreground">
          © {{ new Date().getFullYear() }} DDSC Launcher.
        </div>
        <div class="text-sm text-muted-foreground">
          Developed by YushMC and the DDSC Team.
        </div>
      </UContainer>
    </template>
  </UModal>
</template>

<script setup lang="ts"></script>

<style scoped></style>
