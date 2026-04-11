<template>
  <UModal
    title="Instalar Doki Doki Literature Club"
    :closeable="true"
    class="relative"
  >
    <UTooltip text="Instalar DDLC">
      <UButton
        variant="outline"
        size="xl"
        icon="i-lucide-download"
        color="warning"
        v-if="!isDDLCExist"
      >
        Instalar DDLC
      </UButton>
    </UTooltip>
    <template #body>
      <div class="flex flex-col items-center gap-5 w-full">
        <div
          class="flex flex-col items-center gap-5 w-full"
          v-if="pathSelected.trim() === ''"
        >
          <h2 class="text-lg font-bold text-warning">
            Parece que no están cargados los archivos de Doki Doki Literature
            Club
          </h2>
          <p class="text-sm text-gray-600 text-center">
            Para poder usar el launcher, necesitas tener los archivos del juego.
            Puedes descargarlos gratis desde la página oficial del juego.
          </p>
          <div class="flex flex-col items-center gap-5 w-full">
            <UButton
              color="primary"
              variant="outline"
              target="_blank"
              href="https://ddlc.moe/"
              icon="i-lucide-globe"
            >
              Descargar desde la página oficial
            </UButton>
          </div>
          <UAlert
            title="Importante"
            variant="soft"
            :description="`Revisa que has descargado la version para tu SO (${osName})`"
            icon="i-lucide-star"
            class="w-full"
            color="warning"
          />
          <UAlert
            title="¿Ya tienes el juego descargado?"
            variant="soft"
            description="Si ya tienes el juego descargado. Haz clic en el botón de abajo para seleccionar la carpeta o archivo."
            icon="i-lucide-star"
            class="w-full"
            color="info"
          />
          <div class="flex items-center gap-2 justify-center w-full">
            <UButton
              color="primary"
              variant="outline"
              icon="i-lucide-folder"
              @click="handleSelectFile('folder')"
            >
              Seleccionar carpeta
            </UButton>
            <UButton
              color="primary"
              variant="outline"
              icon="i-lucide-file"
              @click="handleSelectFile('zip')"
            >
              Seleccionar archivo .zip
            </UButton>
          </div>
        </div>

        <div v-else>
          <h2 class="text-lg font-bold text-success">
            ¡Archivo seleccionado correctamente!
          </h2>
          <p class="text-sm text-gray-600 text-center my-5">
            Has seleccionado: <br />
            <span class="font-mono text-sm text-white">{{ pathSelected }}</span>
          </p>
          <UAlert
            title="Siguiente paso"
            variant="soft"
            description="Ahora que has seleccionado el archivo o carpeta, el launcher intentará cargar los archivos del juego. Si todo está correcto, podrás empezar a jugar y usar mods."
            icon="i-lucide-star"
            class="w-full"
            color="success"
          />
          <UButton
            color="primary"
            size="xl"
            variant="outline"
            icon="i-lucide-check"
            class="mt-5 w-full"
            @click="handleCopyFile"
          >
            Iniciar con la carga de archivos
          </UButton>
        </div>
      </div>
      <UButton
        class="absolute top-4 right-20"
        color="error"
        variant="outline"
        target="_blank"
        icon="i-lucide-refresh-ccw"
        @click="pathSelected = ''"
        v-if="pathSelected.trim() !== ''"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { getSystemOS } = useSO();
const toast = useToast();
const isDDLCExist = ref<boolean>(false);
const osName = ref<string | null>(null);
const typeofFileSelected = ref<"zip" | "folder" | null>(null);
const pathSelected = ref<string>("");

const handleSelectFile = async (type: "zip" | "folder") => {
  try {
    if (type === "zip") {
      const filePath = await window.api.files.select.zipFile();
      if (filePath) {
        typeofFileSelected.value = "zip";
        pathSelected.value = filePath; // ✅ ruta absoluta real
      }
    } else if (type === "folder") {
      const folderPath = await window.api.files.select.folder();
      if (folderPath) {
        typeofFileSelected.value = "folder";
        pathSelected.value = folderPath; // ✅ ruta absoluta real
      }
    }
  } catch (error) {
    toast.add({
      title: "Error al seleccionar el archivo",
      description:
        "Ocurrió un error al seleccionar el archivo. Por favor, intenta nuevamente.",
      color: "error",
    });
  }
};

const unzipDDLCFileZip = async () => {
  try {
    const osFolderName =
      osName.value === "windows" ? "ddlc-windows" : "ddlc-mac";
    const isDDLCExist = await window.api.files.check(osFolderName);

    if (isDDLCExist?.data) {
      toast.add({
        title: "Carpeta ya existente",
        description: "La carpeta ya existe en tu directorio de usuario.",
        color: "error",
      });
      return;
    }

    const createTempFolderResponse =
      await window.api.files.create.directory(osFolderName);
    if (!createTempFolderResponse.success) {
      toast.add({
        title: "Error al crear carpeta temporal",
        description:
          "Ocurrió un error al crear la carpeta temporal para descomprimir el archivo. Por favor, intenta nuevamente.",
        color: "error",
      });
      return;
    }
    const unZip = await window.api.files.unzip.file(
      pathSelected.value,
      osFolderName,
    );

    if (!unZip.success) {
      toast.add({
        title: "Error al descomprimir el archivo",
        description: `Ocurrió un error al descomprimir el archivo. ${unZip.message ? String(unZip.message) : "Intenta nuevamente."}`,
        color: "error",
      });
      return;
    }

    toast.add({
      title: "Archivo descomprimido exitosamente",
      description: "El archivo ha sido descomprimido correctamente.",
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Error al descomprimir el archivo",
      description: `Ocurrió un error al descomprimir el archivo. ${error instanceof Error ? error.message : "Intenta nuevamente."}`,
      color: "error",
    });
    throw error;
  }
};

const handleCopyFile = async () => {
  try {
    if (pathSelected.value.trim() === "") {
      toast.add({
        title: "No se ha seleccionado ningún archivo",
        description:
          "Por favor, selecciona un archivo o carpeta antes de continuar.",
        color: "warning",
      });
      return;
    }

    toast.add({
      title: "Procesando archivo",
      description:
        "Por favor, espera mientras se procesa el archivo seleccionado.",
      color: "info",
    });

    if (typeofFileSelected.value === "zip") {
      await unzipDDLCFileZip();
    } else if (typeofFileSelected.value === "folder") {
      await window.api.files.copy.internal.toInternal(
        pathSelected.value,
        osName.value === "windows" ? "ddlc-windows" : "ddlc-mac",
      );
    }

    isDDLCExist.value = true;

    toast.add({
      title: "Archivo procesado exitosamente",
      description: "El archivo ha sido procesado correctamente.",
      color: "success",
    });
    window.location.reload();
  } catch (error) {
    toast.add({
      title: "Error al procesar el archivo",
      description:
        "Ocurrió un error al procesar el archivo. Por favor, intenta nuevamente.",
      color: "error",
    });
  }
};

onBeforeMount(() => {
  osName.value = getSystemOS();
});
</script>

<style scoped></style>
