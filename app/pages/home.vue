<template>
  <div class="w-full relative">
    <UContainer
      class="flex w-full h-full items-start gap-5 p-1 justify-start flex-wrap relative"
    >
      <div
        class="w-[50px] h-fit p-0 m-0 flex"
        v-for="mod in modsToPlay"
        :key="mod.id"
      >
        <UModal :title="`Info del mod: ${mod.name}`">
          <UTooltip :text="mod.name">
            <NuxtImg
              :src="mod.logo"
              :alt="mod.name"
              width="50"
              height="50"
              class="object-cover cursor-pointer rounded-md"
            />
          </UTooltip>
          <template #body>
            <div class="flex flex-col items-start gap-5 w-full">
              <div class="flex flex-col items-start gap-3">
                <h2 class="text-lg font-bold">{{ mod.name }}</h2>
              </div>
              <div class="flex w-full justify-center relative">
                <NuxtImg
                  :src="mod.main_image"
                  :alt="mod.name"
                  class="object-cover rounded-md w-full h-auto"
                />
                <NuxtImg
                  :src="mod.logo"
                  :alt="mod.name"
                  width="80"
                  class="object-cover rounded-md h-auto absolute bottom-[-20px] left-[-10px]"
                />
              </div>
              <details class="w-full rounded-md p-3 mt-5">
                <summary class="cursor-pointer text-sm font-medium">
                  Estadisticas del mod
                </summary>
              </details>
              <div class="flex w-full justify-between">
                <UButton
                  color="error"
                  variant="soft"
                  target="_blank"
                  icon="i-lucide-trash"
                  size="xs"
                  >Eliminar</UButton
                >
                <UButton
                  color="info"
                  variant="soft"
                  target="_blank"
                  icon="i-lucide-folder"
                  size="xs"
                  >Ver archivos</UButton
                >
                <UButton
                  color="primary"
                  @click="handleRunApp(mod)"
                  icon="i-lucide-play"
                  size="xl"
                  >Ejecutar mod</UButton
                >
              </div>
            </div>
          </template>
        </UModal>
      </div>
    </UContainer>
    <UContainer
      class="w-fit fixed bottom-25 right-2 p-0 m-0 flex items-center justify-center gap-5"
    >
      <Instalacion v-if="!existsDDLCFolder" />
      <Mods />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { SystemName } from "~/types/systemData";

const { checkFile, createDirectory, runFileMacOS, runFileWindows } =
  useFilesApiElectron();
const { getAllMods } = useModApiElectron();
const { getIdUser, setDirectoryName, getSystemOS } = useSO();
const toast = useToast();

const modsToPlay = ref<ModDBInterface[]>([]);
const osName = ref<SystemName | null>(null);
const existsDDLCFolder = ref<boolean>(false);
const directoryName = ref("user");
const id_user = ref<number | null>(null);

const initializeUserDirectory = async () => {
  id_user.value = getIdUser();

  if (!id_user.value) {
    navigateTo("/");
    return;
  }

  directoryName.value = `user_${id_user.value}_data`;

  const response = await checkFile(directoryName.value);

  if (response.success && !response.data) {
    const responseCreate = await createDirectory(directoryName.value);
    if (responseCreate.success) {
      setDirectoryName(directoryName.value);
    }
    const toastConfig = {
      title: responseCreate.success
        ? "Directorio creado correctamente"
        : "Error al crear el directorio",
      description: String(responseCreate.message),
      color: responseCreate.success ? ("success" as const) : ("error" as const),
    };
    toast.add(toastConfig);
  } else if (response.success) {
    setDirectoryName(directoryName.value);
  }
};

const handleRunApp = async (mod: ModDBInterface) => {
  if (!osName.value) {
    return;
  }

  let response;

  switch (osName.value) {
    case "Windows":
      response = await runFileWindows(mod.path);
      break;
    case "MacOS":
      response = await runFileMacOS(mod.path);
      break;
    default:
      toast.add({
        title: "Sistema operativo no soportado",
        description: `Tu sistema operativo (${osName.value}) no es compatible con esta función.`,
        color: "error",
      });
  }

  if (response && !response.success) {
    toast.add({
      title: "Error al ejecutar el mod",
      description: String(response.message),
      color: "error",
    });
  }
  if (response && response.success) {
    toast.add({
      title: "Mod ejecutado correctamente",
      description: `El mod "${mod.name}" se ha ejecutado exitosamente.`,
      color: "success",
    });
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

onBeforeMount(async () => {
  await initializeUserDirectory();
  osName.value = getSystemOS();
  if (!osName.value) {
    toast.add({
      title: "Error al detectar el sistema operativo",
      description:
        "No se pudo determinar tu sistema operativo. Por favor, intenta nuevamente.",
      color: "error",
    });
    navigateTo("/");
    return;
  }
  const responseDirectoryDDLC = await checkIFDDLCFolderExists(osName.value);
  if (responseDirectoryDDLC.success && responseDirectoryDDLC.data) {
    existsDDLCFolder.value = responseDirectoryDDLC.data;
  }
  const response = await getAllMods();
  if (response.success && response.data) {
    modsToPlay.value = response.data;
  } else {
    toast.add({
      title: "Error al cargar los mods",
      description: String(response.message),
      color: "error",
    });
  }
});
</script>
