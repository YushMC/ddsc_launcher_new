<template>
  <div class="w-full flex flex-col relative">
    <div class="w-full flex items-start justify-center relative">
      <!-- SIDEBAR -->
      <div
        class="w-[500px] overflow-y-auto overflow-x-hidden sticky top-0 max-h-[92dvh]"
      >
        <UCard
          class="w-full h-fit p-0 m-0 flex flex-col mb-5 sticky top-0 z-10"
        >
          <UFormField label="Buscar mod">
            <UInput
              v-model="searchName"
              placeholder="Buscar mod por nombre..."
              class="w-[300px]"
            />
          </UFormField>
        </UCard>

        <UContainer class="flex w-full flex-col p-2">
          <div class="w-full flex flex-col gap-5">
            <div
              v-if="filteredMods.length > 0"
              v-for="mod in filteredMods"
              :key="mod.id"
              class="w-full h-[200px] flex transition-all duration-300 ease-in-out rounded-md relative ring-4"
              :class="
                modDetails?.id === mod.mod_id_api ? 'ring-primary ml-3' : ''
              "
            >
              <UTooltip :text="mod.name">
                <div class="w-full h-full relative">
                  <NuxtImg
                    :src="mod.main_image"
                    :alt="mod.name"
                    class="object-cover cursor-pointer rounded-md w-full h-full"
                    @click="setDataMod(mod)"
                  />

                  <UButton
                    color="primary"
                    icon="i-lucide-play"
                    :ui="{ base: 'text-white' }"
                    @click="handleRunApp(mod)"
                    variant="solid"
                    size="xl"
                    class="absolute bottom-2 right-2 z-10"
                    :class="
                      modDetails?.id === mod.mod_id_api ? 'flex' : 'hidden'
                    "
                  />
                </div>
              </UTooltip>
            </div>
            <div v-else>
              <UAlert
                title="Importante"
                description="No se han encontrado mods que coincidan con tu búsqueda. Por favor, intenta con otro nombre "
                class="w-full"
                variant="soft"
                color="warning"
                icon="i-lucide-triangle-alert"
              />
            </div>
          </div>
        </UContainer>
      </div>

      <!-- CONTENT -->
      <div class="w-full flex items-start justify-start border-left p-5">
        <div
          v-if="modDetails"
          class="w-full h-full p-4 flex flex-col gap-3 justify-start items-start"
        >
          <h2 class="text-xl font-bold">{{ modDetails.name }}</h2>

          <UCarousel
            v-slot="{ item }"
            class="w-full mb-5"
            :items="modDetails.images"
            arrows
            dots
            :ui="{
              item: 'basis-1/3 ps-0 ',
              prev: 'sm:start-8',
              next: 'sm:end-8',
              container: 'ms-0 ',
            }"
          >
            <NuxtImg
              :src="item.url"
              :alt="modDetails.name"
              class="rounded-md object-contain w-full aspect-video"
              loading="lazy"
            />
          </UCarousel>
          <ModsTags
            :generes="modDetails.genres.map((g) => g.name)"
            :status="modDetails.status"
            :duration="modDetails.duration"
            :character="modDetails.character"
          />

          <UCard variant="soft" class="flex flex-col gap-5 w-full">
            <div v-if="modToPlay" class="flex items-center justify-start gap-5">
              <UButton
                icon="i-lucide-play"
                size="xl"
                color="info"
                @click="handleRunApp(modToPlay)"
              >
                Lanzar Mod</UButton
              >
              <UButton
                icon="i-lucide-trash"
                size="xl"
                color="error"
                @click="handleDeleteMod(modToPlay)"
              >
                Eliminar Mod</UButton
              >
            </div>
            <div
              class="w-full max-h-[20dvh] overflow-y-auto overflow-x-hidden p-2 rounded-md"
              v-html="modDetails.description"
            ></div>
          </UCard>
        </div>
        <div
          class="w-full min-h-[50dvh] flex justify-center items-center gap-5"
          v-else
        >
          <div
            class="w-full h-full flex items-center justify-center flex-col gap-5"
          >
            <h1 class="text-3xl font-bold">Bienvenido</h1>
            <p>Selecciona un mod de la izquierda para ver sus detalles aquí.</p>
            <NuxtImg
              src="https://www.dokidokispanish.club/images/404.webp"
              alt="Logo DDSC"
              width="500"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- FLOATING BUTTONS -->
    <UContainer class="w-fit fixed bottom-5 right-2 flex gap-5 z-10">
      <Instalacion v-if="!existsDDLCFolder" />
      <Mods />
    </UContainer>

    <!-- INITIAL MODAL -->
    <IntialModal />
  </div>
</template>

<script setup lang="ts">
import IntialModal from "~/components/intialModal.vue";
import { useLibraryMods } from "~/composables/useLibraryMods";
import type { SystemName } from "~/types/systemData";

const { getAllMods, getModByIdApi } = useModApiElectron();
const { getSystemOS } = useSO();
const toast = useToast();

const { deleteMod, checkIFDDLCFolderExists, runApp, initializeUserDirectory } =
  useLibraryMods();

const modsToPlay = ref<ModDBInterface[]>([]);
const modToPlay = ref<ModDBInterface | null>(null);
const searchName = ref("");
const modDetails = ref<ModInterfaceApi | null>(null);
const osName = ref<SystemName | null>(null);
const existsDDLCFolder = ref<boolean>(false);

const setDataMod = async (mod: ModDBInterface) => {
  modToPlay.value = mod;
  const response = await getModByIdApi(mod.mod_id_api);
  if (response?.sucess && response.data) {
    modDetails.value = response.data;
  } else {
    toast.add({
      title: "Error al cargar los detalles del mod",
      description: String(response?.message || "Error desconocido"),
      color: "error",
    });
  }
};

const filteredMods = computed<ModDBInterface[]>(() => {
  if (!searchName.value) {
    return modsToPlay.value;
  }
  return modsToPlay.value.filter((mod) =>
    mod.name.toLowerCase().includes(searchName.value.toLowerCase()),
  );
});

const handleDeleteMod = async (mod: ModDBInterface) => {
  if (
    !confirm(
      "¿Estás seguro de que deseas eliminar este mod? Esta acción no se puede deshacer.",
    )
  ) {
    return;
  }
  const response = await deleteMod(mod);

  toast.add({
    title: "Aviso",
    description: String(response.message),
    color: response.success ? "success" : "error",
  });

  // Actualizar la lista de mods después de eliminar
  const updatedModsResponse = await getAllMods();
  if (updatedModsResponse.success && updatedModsResponse.data) {
    modsToPlay.value = updatedModsResponse.data;
    modToPlay.value = null; // Limpiar los detalles del mod eliminado
  }
};

const handleRunApp = async (mod: ModDBInterface) => {
  if (!osName.value) {
    toast.add({
      title: "Error al detectar el sistema operativo",
      description:
        "No se pudo determinar tu sistema operativo. Por favor, intenta nuevamente.",
      color: "error",
    });
    return;
  }
  const response = await runApp(mod, osName.value);
  if (!response?.success) {
    toast.add({
      title: "Error al lanzar el mod",
      description: String(response?.message),
      color: "error",
    });
  }
};

const start = async () => {
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
};

onBeforeMount(async () => {
  osName.value = getSystemOS();
  await initializeUserDirectory();
  await start();
});
</script>
