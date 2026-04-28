<template>
  <UModal title="Agregar Mod" :closeable="true">
    <UTooltip text="Agregar un nuevo mod ">
      <UButton variant="solid" size="xl" icon="i-lucide-book-plus">
        Add Mod
      </UButton>
    </UTooltip>
    <template #body>
      <UAlert
        v-if="!existsDDLCFolder"
        title="URGENTE"
        variant="soft"
        description="No se ha encontrado la carpeta del juego. Por favor, asegúrate de realizar el proceso de instalación."
        icon="i-lucide-triangle-alert"
        class="mb-5"
        color="error"
      />

      <div v-else class="flex flex-col gap-5 w-full">
        <UAlert
          v-if="getSystemOS() === 'MacOS'"
          title="IMPORTANTE"
          variant="soft"
          :description="`Para ${getSystemOS()}, no se podrán ejecutar mods con ejecutables propios, por lo que solo se podrán ejecutar mods que sean modificaciones de archivos del juego original.`"
          icon="i-lucide-triangle-alert"
          class="mb-5"
          color="warning"
        />

        <div class="flex flex-col gap-5 w-full">
          <UFormField label="Selecciona un Mod">
            <USelectMenu
              v-model="modId"
              :items="itemsMods"
              value-key="value"
              placeholder="Nombre del mod"
              class="w-full"
            />
          </UFormField>
          <UContainer
            class="flex flex-col gap-5 items-center justify-center p-5 w-full border rounded-md border-muted"
            variant="soft"
            v-if="modId"
          >
            <UFormField label="Ruta de la carpeta del Mod" class="w-full">
              <div class="flex items-center gap-2 justify-start w-full">
                <UInput
                  v-model="pathFileFolder"
                  placeholder="Ruta de la carpeta del Mod"
                  class="w-full"
                />
                <UButton
                  variant="ghost"
                  class="w-fit h-fit"
                  icon="i-lucide-folder-open"
                  @click="openFilePicker"
                >
                </UButton>
              </div>
            </UFormField>
          </UContainer>
          <UCard
            variant="soft"
            v-if="pathFileFolder.trim() !== ''"
            class="flex items-center justify-center w-full border border-muted rounded-md gap-5"
          >
            <h1>
              ¿Es necesario eliminar alguno de los siguientes archivos de
              scripts?
            </h1>
            <UFormField
              label="Eliminar Scripts.rpa"
              class="flex items-center justify-evenly w-full"
            >
              <UCheckbox v-model="isRequiredDeleteFileScripts" />
            </UFormField>
          </UCard>

          <UButton
            v-if="pathFileFolder.trim() !== ''"
            variant="outline"
            size="lg"
            icon="i-lucide-download"
            @click="hanldeModeInstallation"
          >
            Instalar Mod
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { SystemName } from "~/types/systemData";
const { checkIFDDLCFolderExists } =
  useLibraryMods();

const toast = useToast();
const osName = ref<SystemName | null>(null);
const { getSystemOS, getIdUser, getDirectoryName } = useSO();
const { installModWithModeFolder } = useInstallation();
const { registerMod } = useModApiElectron();
const isRequiredDeleteFileScripts = ref(false);
const modId = ref<number | undefined>(undefined);
const itemsMods = ref<{ label: string; value: number }[]>([]);

const existsDDLCFolder = ref<boolean>(false);

const pathFileFolder = ref<string>("");
const ModsList = ref<ModResponseInterface[]>([]);

const openFilePicker = async () => {
  const folderPath = await window.api.files.select.folder();
  if (folderPath) {
    pathFileFolder.value = folderPath; // ✅ ruta absoluta real
  }
};

const getAllModsFromApi = async () => {
  try {
    const { data, error, execute } = useFetch<{ data: ModResponseInterface[] }>(
      "https://api-new.dokidokispanish.club/mod/all",
      {
        method: "GET",
        key: "fetch_all_mods",
        server: true,
        lazy: true,
        immediate: false,
        cache: "force-cache",
        deep: true,
      },
    );
    await execute();

    if (!data.value || error.value) return;

    ModsList.value = data.value.data.filter(
      (mod) =>
        mod.resource.download_pc && mod.resource.download_pc.trim() !== "",
    );
    itemsMods.value = ModsList.value.map((mod) => ({
      label: mod.resource.name,
      value: mod.resource.id,
    }));
  } catch (error) {
    console.error("Error fetching mods:", error);
  }
};


const hanldeModeInstallation = async () => {
  if (!modId.value) {
    toast.add({
      title: "Error",
      description: "Por favor, selecciona un mod para instalar.",
      color: "error",
    });
    return;
  }

  const selectedMod = ModsList.value.find(
    (mod) => mod.resource.id === modId.value,
  );
  if (!selectedMod) {
    toast.add({
      title: "Error",
      description: "El mod seleccionado no se encuentra en la lista.",
      color: "error",
    });
    return;
  }

  if (pathFileFolder.value.trim() === "") {
    toast.add({
      title: "Error",
      description: "Por favor, proporciona la ruta de la carpeta del mod.",
      color: "error",
    });
    return;
  }

  const baseDirectory = getDirectoryName();
  if (!baseDirectory) {
    toast.add({
      title: "Error",
      description: "No se ha encontrado la carpeta del juego.",
      color: "error",
    });
    return;
  }

  if (!osName.value) {
    toast.add({
      title: "Error",
      description: "No se ha podido determinar el sistema operativo.",
      color: "error",
    });
    return;
  }

  const installationToast = toast.add({
    title: "Instalando Mod",
    description: `Se está instalando el mod "${selectedMod.resource.name}". Por favor, espera...`,
    color: "info",
    icon: "i-lucide-loader",
    duration: 200000, // No se cierra automáticamente
  });
  const installationToastId = installationToast.id;

  const response = await installModWithModeFolder(
    isRequiredDeleteFileScripts.value,
    selectedMod.resource.slug.replaceAll(/-/g, "_"),
    pathFileFolder.value,
    osName.value,
  );

  if (response.success && response.finalPath) {
    const registerResponse = await registerMod({
      name: selectedMod.resource.name,
      mod_id_api: selectedMod.resource.id,
      name_folder: `mod_${selectedMod.resource.slug.replaceAll(/-/g, "_")}`,
      logo:
        selectedMod.resource.images.find((img) => img.type === "logo")?.url ||
        "",
      main_image:
        selectedMod.resource.images.find((img) => img.type === "main")?.url ||
        "",
      path: response.finalPath,
    });

    if (!registerResponse.success) {
      await window.api.files.delete.directory(
        `user_data/${selectedMod.resource.slug.replaceAll(/-/g, "_")}`,
      ); // Elimina los archivos copiados si no se pudo registrar el mod en la base de datos
      toast.add({
        title: "Error",
        description: `Error registering mod in database: ${registerResponse.message}`,
        color: "error",
      });
    }
  }

  toast.update(installationToastId, {
    title: response.success ? "Mod instalado" : "Error",
    description: String(response.message),
    icon: response.success ? "i-lucide-check" : "i-lucide-alert-circle",
    color: response.success ? "success" : "error",
    duration: 5000,
  });
  //window.location.reload(); // Recarga la página para actualizar la lista de mods instalados
};

onBeforeMount(async () => {
  osName.value = getSystemOS();
  if (osName.value) {
    const response = await checkIFDDLCFolderExists(osName.value);
    if (response.success && response.data) {
      existsDDLCFolder.value = response.data;
      await getAllModsFromApi();
    }
  }
});
</script>

<style scoped></style>
