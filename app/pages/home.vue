<template>
  <UContainer
    class="flex w-full h-full items-start gap-5 p-1 justify-start flex-wrap"
  >
    <div class="w-[50px] h-fit p-0 m-0 flex">
      <UTooltip v-for="mod in modsToPlay" :key="mod.id" :text="mod.name">
        <NuxtImg
          :src="mod.logo"
          :alt="mod.name"
          width="50"
          height="50"
          class="object-cover cursor-pointer rounded-md"
          @click="handleRunApp(mod)"
        />
      </UTooltip>
    </div>
  </UContainer>
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

onBeforeMount(async () => {
  await initializeUserDirectory();
  osName.value = getSystemOS();
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
