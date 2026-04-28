<template>
  <UModal
    title="Configuración inicial"
    :dismissible="false"
    v-model:open="instalationLaunher.showModal"
  >
    <template #content>
      <div
        class="w-full h-full flex items-center justify-center flex-col gap-5 p-5"
      >
        <h2 class="text-xl font-bold">¡Parece que es tu primera vez aquí!</h2>
        <p>
          Para comenzar, necesitamos configurar un directorio donde se guardarán
          tus mods y datos de usuario. Haz clic en el botón a continuación para
          crear este directorio.
        </p>
        <UAlert
          title="Importante"
          description="Si no se selecciona un directorio, se utilizará el predeterminado. Esta acción solo se realizará una vez."
          variant="soft"
          color="warning"
          icon="i-lucide-triangle-alert"
        />
        <UFormField class="w-full" label="Ubicación del directorio">
          <div class="w-full flex items-center gap-2">
            <UInput
              v-model="instalationLaunher.folder"
              label="Directorio de guardado"
              placeholder="Ingresa la ubicación del directorio"
              class="w-full"
            />
            <UButton
              variant="ghost"
              class="w-fit h-fit"
              icon="i-lucide-folder-open"
              @click="openFilePicker"
            />
          </div>
        </UFormField>

        <UButton
          color="primary"
          @click="startIntialFolder"
          class="w-fit h-fit"
          icon="i-lucide-check"
        >
          Configurar Directorio</UButton
        >
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { getSystemOS } = useSO();
const { createDirectory } = useFilesApiElectron();
const toast = useToast();
const directoryName = ref("ddsc_launcher_user_data");
const instalationLaunher = ref({
  showModal: false,
  folder: "",
});

const openFilePicker = async () => {
  if (!getSystemOS()) {
    toast.add({
      title: "Error al detectar el sistema operativo",
      description:
        "No se pudo determinar tu sistema operativo. Por favor, intenta nuevamente.",
      color: "error",
    });
    return;
  }

  const folderPath = await window.api.files.select.folder();
  if (folderPath) {
    instalationLaunher.value.folder = folderPath; // ✅ ruta absoluta real
  }
  return;
};

const startIntialFolder = async () => {
  try {
    const pathToSet = instalationLaunher.value.folder.trim()
      ? `${instalationLaunher.value.folder}/${directoryName.value}`
      : await window.api.files.getAbsoluteDefaultPath(directoryName.value);

    // Verificar si el directorio ya existe
    await createFolderAndUser(pathToSet);
  } catch (error) {
    toast.add({
      title: "Error inesperado",
      description: "Ocurrió un error durante la configuración.",
      color: "error",
    });
  }
};

const createFolderAndUser = async (pathToSet: string) => {
  // Create directory
  const createResponse = await createDirectory(pathToSet);
  if (!createResponse.success) {
    toast.add({
      title: "Error al crear el directorio",
      description: String(createResponse.message),
      color: "error",
    });
    return;
  }

  // Register user
  const registerResponse = await window.api.users.register({
    username: "default_user",
    folder_path: pathToSet,
    is_developer: false,
    is_active: true,
    id: 0,
  });

  if (!registerResponse.success) {
    await window.api.files.delete.directory(pathToSet); // Eliminar directorio creado
    toast.add({
      title: "Error al configurar los datos del usuario",
      description: String(registerResponse.message),
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Directorio creado correctamente",
    description: "El directorio se ha creado y configurado exitosamente.",
    color: "success",
  });

  instalationLaunher.value.showModal = false;
};

onBeforeMount(async () => {
  const getUser = await window.api.users.get.byID(1);
  if (!getUser.success || !getUser.data) {
    if (getSystemOS() && getSystemOS() === "MacOS") {
      await createFolderAndUser("ddsc_launcher_user_data");
      instalationLaunher.value.showModal = false;
      return;
    }
    instalationLaunher.value.showModal = true;
  }
});
</script>

<style scoped></style>
