<template>
  <UCard class="w-full flex flex-col gap-5" variant="soft">
    <UContainer class="flex items-center justify-center p-0 m-0 flex-col gap-5">
      <div class="text-lg text-muted-foreground">Mods</div>
      <div class="flex items-center justify-center gap-5">
        <UModal title="Agregar Mod" :closeable="true">
          <UButton variant="outline" size="xl" icon="i-lucide-book-plus">
            Add Mod
          </UButton>
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
                v-if="getSystemOS() === 'MacOS' || getSystemOS() === 'Linux'"
                title="IMPORTANTE"
                variant="soft"
                :description="`Para ${getSystemOS()}, no se podrán ejecutar mods con archivos .exe propios, por lo que solo se podrán ejecutar mods que sean modificaciones de archivos del juego original.`"
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
                  <UFormField
                    label="Ruta del Archivo Zip (Mod)"
                    class="w-full"
                    v-if="pathFileFolder.trim() === ''"
                  >
                    <div class="flex items-center gap-2 justify-start w-full">
                      <UInput
                        v-model="pathFileZip"
                        placeholder="Ruta del Archivo Zip (Mod)"
                        class="w-full"
                      />
                      <UButton
                        variant="ghost"
                        class="w-fit h-fit"
                        icon="i-lucide-folder-open"
                        @click="openFilePicker('zip')"
                      >
                      </UButton>
                    </div>
                  </UFormField>
                  <USeparator
                    label="ó"
                    v-if="
                      pathFileZip.trim() === '' && pathFileFolder.trim() === ''
                    "
                  />
                  <UFormField
                    label="Ruta de la carpeta del Mod"
                    class="w-full"
                    v-if="pathFileZip.trim() === ''"
                  >
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
                        @click="openFilePicker('folder')"
                      >
                      </UButton>
                    </div>
                  </UFormField>
                </UContainer>

                <UButton
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

        <UButton variant="outline" size="xl" icon="i-lucide-book-plus">
        </UButton>
      </div>
    </UContainer>
  </UCard>
</template>

<script setup lang="ts">
import type { SystemName } from "~/types/systemData";
import CONST_KEYS from "~/utils/constants";

const toast = useToast();
const osName = ref<SystemName | null>(null);
const { getSystemOS, getIdUser, getDirectoryName } = useSO();
const { installModWithModeFolder, installModWithZipFile } = useInstallation();
const modId = ref<number | undefined>(undefined);
const itemsMods = ref<{ label: string; value: number }[]>([]);

const existsDDLCFolder = ref<boolean>(false);

const pathFileZip = ref<string>("");
const pathFileFolder = ref<string>("");
const ModsList = ref<ModResponseInterface[]>([]);

const openFilePicker = async (type: "zip" | "folder") => {
  if (type === "zip") {
    const filePath = await window.api.files.select.zipFile();
    if (filePath) {
      pathFileZip.value = filePath; // ✅ ruta absoluta real
    }
  } else if (type === "folder") {
    const folderPath = await window.api.files.select.folder();
    if (folderPath) {
      pathFileFolder.value = folderPath; // ✅ ruta absoluta real
    }
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

const checkIFDDLCFolderExists = async (osName: SystemName) => {
  let response: ApiResponseDB<boolean>;
  switch (osName) {
    case "Windows":
      response = await window.api.files.check(CONST_KEYS.DDLC_FOLDER.windows);
      break;
    case "Linux":
      response = await window.api.files.check(CONST_KEYS.DDLC_FOLDER.linux);
      break;
    case "MacOS":
      response = await window.api.files.check(CONST_KEYS.DDLC_FOLDER.macos);
      console.log("Response checking DDLC folder on MacOS:", response);
      break;
    default:
      throw new Error("Sistema operativo no soportado");
  }
  return response;
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

  if (pathFileZip.value.trim() === "" && pathFileFolder.value.trim() === "") {
    toast.add({
      title: "Error",
      description:
        "Por favor, proporciona la ruta del archivo zip o de la carpeta del mod.",
      color: "error",
    });
    return;
  }

  if (pathFileZip.value.trim() !== "" && pathFileFolder.value.trim() !== "") {
    toast.add({
      title: "Error",
      description:
        "Por favor, proporciona solo una ruta: o el archivo zip o la carpeta del mod, no ambos.",
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
    close: false,
  });
  const installationToastId = installationToast.id;

  if (pathFileZip.value.trim() !== "") {
    const response = await installModWithZipFile(
      selectedMod.resource.name,
      baseDirectory,
      pathFileZip.value,
      osName.value,
    );

    if (response.success) {
      toast.update(installationToastId, {
        title: "Mod instalado",
        description: `El mod "${selectedMod.resource.name}" se ha instalado correctamente.`,
        color: "success",
        actions: [],
        close: true,
      });
    } else {
      toast.update(installationToastId, {
        title: "Error",
        description: `Hubo un error al instalar el mod "${selectedMod.resource.name}". Por favor, intenta nuevamente.`,
        color: "error",
        actions: [],
        close: true,
      });
    }
  } else if (pathFileFolder.value.trim() !== "") {
    const response = await installModWithModeFolder(
      selectedMod.resource.name,
      baseDirectory,
      pathFileFolder.value,
      osName.value,
    );
    if (response.success) {
      toast.update(installationToastId, {
        title: "Mod instalado",
        description: `El mod "${selectedMod.resource.name}" se ha instalado correctamente.`,
        color: "success",
        actions: [],
        close: true,
      });
    } else {
      toast.update(installationToastId, {
        title: "Error",
        description: `Hubo un error al instalar el mod "${selectedMod.resource.name}". Por favor, intenta nuevamente.`,
        color: "error",
        actions: [],
        close: true,
      });
    }
  }
};

onBeforeMount(async () => {
  if (getIdUser() === null) {
    navigateTo("/");
    return;
  }
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
