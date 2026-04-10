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
        />
      </UTooltip>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const { checkFile, createDirectory } = useFilesApiElectron();
const { getAllMods } = useModApiElectron();
const { getIdUser, setDirectoryName } = useSO();
const toast = useToast();

const modsToPlay = ref<ModDBInterface[]>([]);

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

onBeforeMount(async () => {
  await initializeUserDirectory();
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
